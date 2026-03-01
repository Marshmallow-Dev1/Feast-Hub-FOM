/**
 * ============================================================
 * FOM Connect Hub — Google Apps Script Backend v2
 * ============================================================
 * Deploy as Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * After deploying, copy the Web App URL to APPS_SCRIPT_URL env var.
 * ============================================================
 */

// ---- CONFIGURATION ----
var SHEETS = {
  USERS: "Users",
  FTD_SUBMISSIONS: "FtdSubmissions",
  TITHE_RECORDS: "TitheRecords",
  SERVANT_APPLICATIONS: "ServantApplications",
  CONFIG: "Config",
  EMAIL_LOG: "EmailLog",
};

var SECRET_KEY = "fom-secret-change-this-in-production";

// Google Drive folder ID where FTD photos are saved.
// Create a folder in Drive, set sharing to "Anyone with link can view", paste its ID here.
var DRIVE_FOLDER_ID = "1yLeKZ5S1HT3hWK2OcEd_i98W5Eq0sFcu";

var SUPER_ADMIN_EMAIL = "marshnandez.business@gmail.com";
var INTERCESSORY_HEAD_EMAIL = "marshnandez.business@gmail.com";

// ---- MAIN ENTRY POINT ----

function doPost(e) {
  var response = { success: false, error: "Unknown error" };
  try {
    var payload = JSON.parse(e.postData.contents);
    if (payload.secret !== SECRET_KEY) {
      return jsonResponse({ success: false, error: "Unauthorized" });
    }
    var action = payload.action;
    var data = payload.data || {};

    switch (action) {
      // --- Users ---
      case "createUser":           response = handleCreateUser(data); break;
      case "getUserByEmail":       response = handleGetUserByEmail(data); break;
      case "updateUser":           response = handleUpdateUser(data); break;
      case "listUsers":            response = handleListUsers(); break;

      // --- FTD ---
      case "saveFtdPhoto":         response = handleSaveFtdPhoto(data); break;
      case "submitFtdAttendance":  response = handleSubmitFtdAttendance(data); break;
      case "listFtdPending":       response = handleListFtdPending(); break;
      case "reviewFtdSubmission":  response = handleReviewFtdSubmission(data); break;

      // --- Tithes ---
      case "submitTithe":          response = handleSubmitTithe(data); break;
      case "listTithes":           response = handleListTithes(); break;
      case "verifyTithe":          response = handleVerifyTithe(data); break;

      // --- Servants ---
      case "submitServantApplication":      response = handleSubmitServantApplication(data); break;
      case "listServantApplications":       response = handleListServantApplications(data); break;
      case "getUserServantApplications":    response = handleGetUserServantApplications(data); break;
      case "reviewServantApplication":      response = handleReviewServantApplication(data); break;

      // --- LG Requests ---
      case "submitLgRequest":      response = handleSubmitLgRequest(data); break;

      // --- Prayer Requests ---
      case "submitPrayerRequest":  response = handleSubmitPrayerRequest(data); break;

      // --- Settings / Stats ---
      case "getSettings":          response = handleGetSettings(); break;
      case "updateSettings":       response = handleUpdateSettings(data); break;
      case "getStats":             response = handleGetStats(); break;

      default:
        response = { success: false, error: "Unknown action: " + action };
    }
  } catch (err) {
    response = { success: false, error: err.toString() };
  }
  return jsonResponse(response);
}

function doGet(e) {
  return jsonResponse({ success: true, message: "FOM Connect Hub API v2 is running." });
}

// ============================================================
// USERS
// ============================================================

function handleCreateUser(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.USERS, [
    "id", "email", "password_hash", "full_name", "birthday", "contact",
    "auth_provider", "role", "account_type", "account_status", "servant_status",
    "family_ministry", "service_ministries", "lg_name", "discipleship_status", "created_at", "sex",
    "how_heard", "invited_by"
  ]);

  // Check if user already exists
  var existing = findUserByEmail(sheet, data.email);
  if (existing) {
    return { success: false, error: "User already exists" };
  }

  var id = Utilities.getUuid();
  var now = new Date().toISOString();

  // Super admin email always gets SUPER_ADMIN role and full access
  var isSuperAdmin = data.email && data.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  var row = [
    id,
    data.email || "",
    data.password_hash || "",
    data.full_name || "",
    data.birthday || "",
    data.contact || "",
    data.auth_provider || "credentials",
    isSuperAdmin ? "SUPER_ADMIN" : (data.role || "MEMBER"),
    isSuperAdmin ? "FEAST_ATTENDEE" : (data.account_type || "FIRST_TIMER"),
    isSuperAdmin ? "ACTIVE_MEMBER" : (data.account_status || "FTD_NOT_ATTENDED"),
    data.servant_status || "NONE",
    data.family_ministry || "",
    data.service_ministries || "",
    data.lg_name || "",
    data.discipleship_status || "",
    now,
    data.sex || "",
    data.how_heard || "",
    data.invited_by || ""
  ];

  sheet.appendRow(row);
  return { success: true, data: { id: id, email: data.email } };
}

function handleGetUserByEmail(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.USERS);
  if (!sheet) return { success: false, error: "Users sheet not found" };

  var user = findUserByEmail(sheet, data.email);
  if (!user) return { success: false, error: "User not found" };

  return { success: true, data: user };
}

function handleUpdateUser(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.USERS);
  if (!sheet) return { success: false, error: "Users sheet not found" };

  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var emailCol = headers.indexOf("email");

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][emailCol] === data.email) {
      // Update provided fields
      var updatable = ["role", "account_type", "account_status", "servant_status",
                       "family_ministry", "service_ministries", "lg_name", "discipleship_status",
                       "full_name", "birthday", "contact", "password_hash", "sex",
                       "how_heard", "invited_by"];
      updatable.forEach(function(field) {
        if (data[field] !== undefined) {
          var col = headers.indexOf(field);
          if (col >= 0) sheet.getRange(i + 1, col + 1).setValue(data[field]);
        }
      });
      return { success: true, message: "User updated" };
    }
  }
  return { success: false, error: "User not found" };
}

function handleListUsers() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.USERS);
  if (!sheet) return { success: true, data: [] };
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { success: true, data: [] };
  var headers = rows[0];
  var result = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = rowToObject(headers, rows[i]);
    delete obj.password_hash; // never expose hash
    result.push(obj);
  }
  return { success: true, data: result };
}

// ============================================================
// FTD (FIRST TIMERS' DAY)
// ============================================================

function handleSaveFtdPhoto(data) {
  // data.base64 = base64-encoded image, data.filename, data.mimeType
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    var decoded = Utilities.base64Decode(data.base64);
    var blob = Utilities.newBlob(decoded, data.mimeType || "image/jpeg", data.filename || "ftd-photo.jpg");
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var url = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1200";
    return { success: true, data: { url: url, fileId: file.getId() } };
  } catch (err) {
    return { success: false, error: "Photo upload failed: " + err.toString() };
  }
}

function handleSubmitFtdAttendance(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.FTD_SUBMISSIONS, [
    "id", "user_id", "user_email", "photo_url", "submitted_at", "status",
    "reviewed_by", "reviewed_at", "notes"
  ]);

  var id = Utilities.getUuid();
  var now = new Date().toISOString();

  sheet.appendRow([
    id, data.user_id || "", data.user_email || "", data.photo_url || "",
    now, "FTD_PENDING_APPROVAL", "", "", ""
  ]);

  // Update user status
  handleUpdateUser({ email: data.user_email, account_status: "FTD_PENDING_APPROVAL" });

  // Notify CONNECT_HEAD
  sendFtdSubmissionNotification(data);

  return { success: true, data: { id: id } };
}

function handleListFtdPending() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.FTD_SUBMISSIONS);
  if (!sheet) return { success: true, data: [] };
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { success: true, data: [] };
  var headers = rows[0];
  var result = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = rowToObject(headers, rows[i]);
    obj._rowIndex = i + 1;
    if (obj.status === "FTD_PENDING_APPROVAL") result.push(obj);
  }
  return { success: true, data: result.reverse() };
}

function handleReviewFtdSubmission(data) {
  // data.submissionId, data.decision ("approve" | "deny"), data.reviewerEmail, data.notes, data.userEmail
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.FTD_SUBMISSIONS);
  if (!sheet) return { success: false, error: "Sheet not found" };

  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idCol = headers.indexOf("id");
  var now = new Date().toISOString();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idCol] === data.submissionId) {
      var newStatus = data.decision === "approve" ? "APPROVED" : "DENIED";
      sheet.getRange(i + 1, headers.indexOf("status") + 1).setValue(newStatus);
      sheet.getRange(i + 1, headers.indexOf("reviewed_by") + 1).setValue(data.reviewerEmail || "");
      sheet.getRange(i + 1, headers.indexOf("reviewed_at") + 1).setValue(now);
      sheet.getRange(i + 1, headers.indexOf("notes") + 1).setValue(data.notes || "");

      // Update user account
      if (data.decision === "approve") {
        handleUpdateUser({
          email: data.userEmail,
          account_type: "FEAST_ATTENDEE",
          account_status: "ACTIVE_MEMBER"
        });
        sendFtdApprovalEmail(data.userEmail, true);
      } else {
        handleUpdateUser({
          email: data.userEmail,
          account_status: "FTD_NOT_APPROVED"
        });
        sendFtdApprovalEmail(data.userEmail, false, data.notes);
      }

      return { success: true, message: "Submission reviewed" };
    }
  }
  return { success: false, error: "Submission not found" };
}

// ============================================================
// TITHES
// ============================================================

function handleSubmitTithe(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.TITHE_RECORDS, [
    "id", "user_id", "user_email", "full_name", "amount", "offering_type",
    "payment_method", "reference_number", "prayer_intentions", "thanksgiving",
    "timestamp", "status", "verified_by", "verified_at"
  ]);

  var id = Utilities.getUuid();
  var now = new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" });

  sheet.appendRow([
    id, data.user_id || "", data.user_email || "", data.full_name || "",
    data.amount || "", data.offering_type || "", data.payment_method || "",
    data.reference_number || "", data.prayer_intentions || "",
    data.thanksgiving || "", now, "PENDING", "", ""
  ]);

  sendTitheEmails(data);
  return { success: true, data: { id: id } };
}

function handleVerifyTithe(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.TITHE_RECORDS);
  if (!sheet) return { success: false, error: "TitheRecords sheet not found." };

  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { success: false, error: "No records found." };

  var headers = rows[0];
  var idCol = headers.indexOf("id");
  var statusCol = headers.indexOf("status");
  var verifiedByCol = headers.indexOf("verified_by");
  var verifiedAtCol = headers.indexOf("verified_at");

  if (idCol < 0 || statusCol < 0) return { success: false, error: "Missing required columns." };

  var now = new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" });

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idCol].toString() === data.id) {
      sheet.getRange(i + 1, statusCol + 1).setValue("VERIFIED");
      if (verifiedByCol >= 0) sheet.getRange(i + 1, verifiedByCol + 1).setValue(data.verified_by || "");
      if (verifiedAtCol >= 0) sheet.getRange(i + 1, verifiedAtCol + 1).setValue(now);
      return { success: true };
    }
  }
  return { success: false, error: "Record not found." };
}

function handleListTithes() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.TITHE_RECORDS);
  if (!sheet) return { success: true, data: [] };
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { success: true, data: [] };
  var headers = rows[0];
  var result = [];
  for (var i = 1; i < rows.length; i++) {
    result.push(rowToObject(headers, rows[i]));
  }
  return { success: true, data: result.reverse() };
}

// ============================================================
// SERVANT APPLICATIONS
// ============================================================

// Ministry slug → servant role tag (mirrors roles.ts MINISTRY_TO_SERVANT_ROLE)
var MINISTRY_SERVANT_ROLE = {
  worship: "WORSHIP_SERVANT",
  dance: "DANCE_SERVANT",
  awesome_kids_service: "AWESOME_KIDS_SERVICE_SERVANT",
  liturgical: "LITURGICAL_SERVANT",
  production: "PRODUCTION_SERVANT",
  creatives: "CREATIVES_SERVANT",
  security_logistics: "SECURITY_SERVANT",
  food: "FOOD_SERVANT",
  intercessory: "INTERCESSORY_SERVANT",
  pastoral_care: "PASTORAL_CARE_SERVANT",
  engagers: "ENGAGERS_SERVANT",
};

function handleSubmitServantApplication(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.SERVANT_APPLICATIONS, [
    "id", "user_id", "user_email", "full_name", "ministry", "audition_url",
    "status", "reviewed_by", "reviewed_at", "notes", "why_serve", "serve_roles", "serve_notes"
  ]);

  var id = Utilities.getUuid();
  var now = new Date().toISOString();

  sheet.appendRow([
    id, data.user_id || "", data.user_email || "", data.full_name || "",
    data.ministry || "", data.audition_url || "", "PENDING", "", "", "",
    data.why_serve || "", data.serve_roles || "", data.serve_notes || ""
  ]);

  // Only update servant_status to PENDING if not already an active servant
  var usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.USERS);
  if (usersSheet) {
    var currentUser = findUserByEmail(usersSheet, data.user_email);
    if (currentUser && currentUser.servant_status !== "ACTIVE_SERVANT") {
      handleUpdateUser({ email: data.user_email, servant_status: "PENDING" });
    } else if (!currentUser) {
      handleUpdateUser({ email: data.user_email, servant_status: "PENDING" });
    }
  }

  sendServantApplicationNotification(data);
  return { success: true, data: { id: id } };
}

function handleListServantApplications(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.SERVANT_APPLICATIONS);
  if (!sheet) return { success: true, data: [] };
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { success: true, data: [] };
  var headers = rows[0];
  var result = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = rowToObject(headers, rows[i]);
    obj._rowIndex = i + 1;
    // Filter by ministry if caller provides one (for service heads with specific ministry)
    if (data.ministry) {
      if (obj.ministry !== data.ministry) continue;
    }
    result.push(obj);
  }
  return { success: true, data: result.reverse() };
}

function handleGetUserServantApplications(data) {
  // data.user_email — returns all applications for the given user
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.SERVANT_APPLICATIONS);
  if (!sheet) return { success: true, data: [] };
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { success: true, data: [] };
  var headers = rows[0];
  var result = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = rowToObject(headers, rows[i]);
    if (obj.user_email === data.user_email) {
      result.push(obj);
    }
  }
  return { success: true, data: result };
}

function handleReviewServantApplication(data) {
  // data.applicationId, data.decision ("approve" | "deny"), data.reviewerEmail, data.notes, data.userEmail, data.ministry
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.SERVANT_APPLICATIONS);
  if (!sheet) return { success: false, error: "Sheet not found" };

  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idCol = headers.indexOf("id");
  var ministryCol = headers.indexOf("ministry");
  var now = new Date().toISOString();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idCol] === data.applicationId) {
      var ministry = rows[i][ministryCol] || data.ministry || "";
      var newStatus = data.decision === "approve" ? "ACTIVE_SERVANT" : "DENIED";
      sheet.getRange(i + 1, headers.indexOf("status") + 1).setValue(newStatus);
      sheet.getRange(i + 1, headers.indexOf("reviewed_by") + 1).setValue(data.reviewerEmail || "");
      sheet.getRange(i + 1, headers.indexOf("reviewed_at") + 1).setValue(now);
      sheet.getRange(i + 1, headers.indexOf("notes") + 1).setValue(data.notes || "");

      if (data.decision === "approve") {
        // Add the servant ministry role tag to the user's role field
        var usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.USERS);
        if (usersSheet) {
          var targetUser = findUserByEmail(usersSheet, data.userEmail);
          if (targetUser) {
            var servantRoleTag = MINISTRY_SERVANT_ROLE[ministry] || "";
            var existingRole = targetUser.role || "ATTENDEE";
            var roleTags = existingRole.split(",").map(function(t) { return t.trim(); }).filter(Boolean);
            if (servantRoleTag && roleTags.indexOf(servantRoleTag) === -1) {
              roleTags.push(servantRoleTag);
            }
            // Also update service_ministries field
            var existingServices = (targetUser.service_ministries || "").split(",").map(function(t) { return t.trim(); }).filter(Boolean);
            if (ministry && existingServices.indexOf(ministry) === -1) {
              existingServices.push(ministry);
            }
            handleUpdateUser({
              email: data.userEmail,
              servant_status: "ACTIVE_SERVANT",
              role: roleTags.join(","),
              service_ministries: existingServices.join(","),
            });
          } else {
            handleUpdateUser({ email: data.userEmail, servant_status: "ACTIVE_SERVANT" });
          }
        } else {
          handleUpdateUser({ email: data.userEmail, servant_status: "ACTIVE_SERVANT" });
        }
      } else {
        // Deny: only downgrade servant_status if currently PENDING (not already ACTIVE_SERVANT)
        var usersSheetD = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.USERS);
        if (usersSheetD) {
          var deniedUser = findUserByEmail(usersSheetD, data.userEmail);
          if (deniedUser && deniedUser.servant_status !== "ACTIVE_SERVANT") {
            handleUpdateUser({ email: data.userEmail, servant_status: "DENIED" });
          }
        } else {
          handleUpdateUser({ email: data.userEmail, servant_status: "DENIED" });
        }
      }

      return { success: true, message: "Application reviewed" };
    }
  }
  return { success: false, error: "Application not found" };
}

// ============================================================
// SETTINGS & STATS
// ============================================================

function handleGetSettings() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CONFIG);
  if (!sheet) return { success: true, data: getDefaultSettings() };

  var rows = sheet.getDataRange().getValues();
  var settings = getDefaultSettings();
  for (var i = 0; i < rows.length; i++) {
    var key = rows[i][0];
    var value = rows[i][1];
    if (!key) continue;
    // Sheets auto-converts date-looking strings to Date objects — serialize them back.
    if (value instanceof Date) {
      settings[key] = key === "ftd_date"
        ? Utilities.formatDate(value, "Asia/Manila", "yyyy-MM-dd")
        : Utilities.formatDate(value, "Asia/Manila", "h:mm a");
    } else {
      settings[key] = value !== undefined && value !== null ? value.toString() : "";
    }
  }
  return { success: true, data: settings };
}

function handleUpdateSettings(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.CONFIG, ["key", "value"]);
  var rows = sheet.getDataRange().getValues();

  Object.keys(data).forEach(function(key) {
    var found = false;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(data[key]);
        found = true;
        break;
      }
    }
    if (!found) sheet.appendRow([key, data[key]]);
  });
  return { success: true, message: "Settings updated" };
}

function handleGetStats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var usersSheet = ss.getSheetByName(SHEETS.USERS);
  var ftdSheet = ss.getSheetByName(SHEETS.FTD_SUBMISSIONS);
  var tithesSheet = ss.getSheetByName(SHEETS.TITHE_RECORDS);
  var servantsSheet = ss.getSheetByName(SHEETS.SERVANT_APPLICATIONS);

  var totalUsers = usersSheet ? Math.max(0, usersSheet.getLastRow() - 1) : 0;
  var activeMembers = 0;
  var firstTimers = 0;
  if (usersSheet && usersSheet.getLastRow() > 1) {
    var uRows = usersSheet.getDataRange().getValues();
    var uHeaders = uRows[0];
    var statusCol = uHeaders.indexOf("account_status");
    var typeCol = uHeaders.indexOf("account_type");
    for (var i = 1; i < uRows.length; i++) {
      if (uRows[i][statusCol] === "ACTIVE_MEMBER") activeMembers++;
      if (uRows[i][typeCol] === "FIRST_TIMER") firstTimers++;
    }
  }

  var pendingFtd = 0;
  if (ftdSheet && ftdSheet.getLastRow() > 1) {
    var fRows = ftdSheet.getDataRange().getValues();
    var fHeaders = fRows[0];
    var fStatusCol = fHeaders.indexOf("status");
    for (var j = 1; j < fRows.length; j++) {
      if (fRows[j][fStatusCol] === "FTD_PENDING_APPROVAL") pendingFtd++;
    }
  }

  return {
    success: true,
    data: {
      totalUsers: totalUsers,
      activeMembers: activeMembers,
      firstTimers: firstTimers,
      pendingFtd: pendingFtd,
      totalTithes: tithesSheet ? Math.max(0, tithesSheet.getLastRow() - 1) : 0,
      pendingServants: servantsSheet ? Math.max(0, servantsSheet.getLastRow() - 1) : 0,
    }
  };
}

// ============================================================
// LG REQUESTS
// ============================================================

function handleSubmitLgRequest(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, "LgRequests", [
    "id", "user_id", "user_email", "full_name", "contact", "age", "sex",
    "family_ministry", "messenger_link", "submitted_at", "status"
  ]);

  var id = Utilities.getUuid();
  var now = new Date().toISOString();

  sheet.appendRow([
    id,
    data.user_id || "",
    data.user_email || "",
    data.full_name || "",
    data.contact || "",
    data.age || "",
    data.sex || "",
    data.family_ministry || "",
    data.messenger_link || "",
    now,
    "PENDING"
  ]);

  sendLgRequestNotification(data);
  return { success: true, message: "Light Group request submitted." };
}

// ============================================================
// PRAYER REQUESTS
// ============================================================

function handleSubmitPrayerRequest(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, "PrayerRequests", [
    "id", "full_name", "email", "contact", "prayer_request", "submitted_at"
  ]);

  var id = Utilities.getUuid();
  var now = new Date().toISOString();

  sheet.appendRow([
    id,
    data.full_name || "",
    data.email || "",
    data.contact || "",
    data.prayer_request || "",
    now
  ]);

  sendPrayerRequestNotification(data);
  return { success: true, message: "Prayer request submitted." };
}

// ============================================================
// EMAIL FUNCTIONS
// ============================================================

function sendFtdSubmissionNotification(data) {
  // Notify connect head that a new FTD submission came in
  var body = [
    "A new FTD attendance photo has been submitted for review.",
    "",
    "User Email: " + (data.user_email || ""),
    "Photo URL: " + (data.photo_url || ""),
    "",
    "Please log in to the dashboard to approve or deny:",
    "https://fom-connect-hub.vercel.app/dashboard/admin/ftd",
  ].join("\n");
  safeSendEmail(SUPER_ADMIN_EMAIL, "New FTD Submission Pending Review", body);
}

function sendFtdApprovalEmail(userEmail, approved, notes) {
  if (!userEmail) return;
  var subject, body, html;
  if (approved) {
    subject = "Your FTD attendance has been approved!";
    body = [
      "Congratulations! Your First Timers Day attendance has been verified.",
      "",
      "You now have full access to all features of the FOM Connect Hub:",
      "- Edit your ministry profile",
      "- Become a servant",
      "- Send tithes and offerings",
      "",
      "Log in at: https://fom-connect-hub.vercel.app",
      "",
      "God loves you and we are glad you are part of The Feast OLOPSC Marikina!",
    ].join("\n");
    html = buildEmailHtml([
      '<p style="font-size:18px;font-weight:bold;color:#ff474f;margin:0 0 16px;">Your FTD attendance is approved!</p>',
      '<p style="margin:0 0 12px;">Congratulations! Your First Timers Day attendance has been verified. You are now a full member of The Feast OLOPSC Marikina.</p>',
      '<p style="margin:0 0 8px;font-weight:bold;">You now have access to:</p>',
      '<ul style="margin:0 0 20px;padding-left:20px;">',
      '<li style="margin-bottom:4px;">Edit your ministry profile</li>',
      '<li style="margin-bottom:4px;">Become a servant</li>',
      '<li style="margin-bottom:4px;">Send tithes and offerings</li>',
      '</ul>',
      '<div style="text-align:center;margin:24px 0;">',
      '<a href="https://fom-connect-hub.vercel.app" style="background:#ff474f;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">Go to your Dashboard</a>',
      '</div>',
      '<p style="margin:20px 0 0;color:#666;font-size:13px;">God loves you and we are glad you are part of The Feast!</p>',
    ].join(''));
  } else {
    subject = "Action needed: Please re-upload your FTD attendance photo";
    body = [
      "Thank you for submitting your FTD attendance photo.",
      "",
      "Unfortunately, we were unable to verify your attendance with the photo submitted.",
      notes ? ("Reason: " + notes) : "",
      "",
      "Please log in and upload a clearer photo of your FTD attendance:",
      "https://fom-connect-hub.vercel.app/dashboard/ftd",
      "",
      "If you have any questions, please contact us.",
    ].join("\n");
    html = buildEmailHtml([
      '<p style="font-size:18px;font-weight:bold;color:#ff474f;margin:0 0 16px;">Action needed: Re-upload your photo</p>',
      '<p style="margin:0 0 12px;">Thank you for submitting your FTD attendance photo.</p>',
      '<p style="margin:0 0 12px;">Unfortunately, we were unable to verify your attendance with the photo submitted.</p>',
      notes ? ('<p style="margin:0 0 12px;background:#fff8f8;border-left:3px solid #ff474f;padding:10px 14px;border-radius:4px;"><strong>Reason:</strong> ' + notes + '</p>') : '',
      '<p style="margin:0 0 20px;">Please upload a clearer photo that clearly shows you were at the event.</p>',
      '<div style="text-align:center;margin:24px 0;">',
      '<a href="https://fom-connect-hub.vercel.app/dashboard/ftd" style="background:#ff474f;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">Re-upload Photo</a>',
      '</div>',
      '<p style="margin:20px 0 0;color:#666;font-size:13px;">If you have any questions, please reach out to our Connect team.</p>',
    ].join(''));
  }
  safeSendEmail(userEmail, subject, body, html);
}

function sendTitheEmails(data) {
  var name = data.full_name || "Friend";
  var firstName = name.split(" ")[0] || "Friend";
  var amount = "PHP " + (data.amount || "0");

  if (data.user_email) {
    var receipt = [
      "Dear " + name + ",",
      "",
      "Thank you for your generous offering! May God bless you abundantly.",
      "",
      "OFFERING RECEIPT",
      "------------------------------",
      "Type: " + (data.offering_type || "N/A"),
      "Amount: " + amount,
      "Payment Method: " + (data.payment_method || "N/A"),
      data.reference_number ? ("Reference #: " + data.reference_number) : "",
      "------------------------------",
      "",
      data.prayer_intentions ? ("Prayer Intentions:\n" + data.prayer_intentions + "\n") : "",
      data.thanksgiving ? ("Thanksgiving:\n" + data.thanksgiving + "\n") : "",
      '"Give, and it will be given to you." - Luke 6:38',
      "",
      "With love,",
      "The Feast OLOPSC Marikina - Finance Ministry",
    ].join("\n");
    var receiptHtml = buildEmailHtml([
      '<p style="font-size:18px;font-weight:bold;color:#ff474f;margin:0 0 16px;">Thank you for your offering!</p>',
      '<p style="margin:0 0 16px;">Dear ' + name + ', may God bless you abundantly for your generosity.</p>',
      '<div style="background:#fafafa;border:1px solid #f0f0f0;border-radius:8px;padding:20px;margin:0 0 20px;">',
      '<p style="margin:0 0 4px;font-size:12px;font-weight:bold;color:#999;text-transform:uppercase;letter-spacing:1px;">Offering Receipt</p>',
      '<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">',
      '<tr><td style="padding:6px 0;font-size:13px;color:#666;width:40%;">Type</td><td style="padding:6px 0;font-size:13px;font-weight:bold;color:#1a1a1a;">' + (data.offering_type || "N/A") + '</td></tr>',
      '<tr><td style="padding:6px 0;font-size:13px;color:#666;">Amount</td><td style="padding:6px 0;font-size:16px;font-weight:900;color:#ff474f;">' + amount + '</td></tr>',
      '<tr><td style="padding:6px 0;font-size:13px;color:#666;">Payment Method</td><td style="padding:6px 0;font-size:13px;font-weight:bold;color:#1a1a1a;">' + (data.payment_method || "N/A") + '</td></tr>',
      data.reference_number ? '<tr><td style="padding:6px 0;font-size:13px;color:#666;">Reference #</td><td style="padding:6px 0;font-size:13px;font-weight:bold;color:#1a1a1a;">' + data.reference_number + '</td></tr>' : '',
      '</table></div>',
      data.prayer_intentions ? '<div style="background:#fff8f8;border-left:3px solid #ff474f;padding:12px 16px;border-radius:4px;margin-bottom:12px;"><p style="margin:0 0 4px;font-weight:bold;font-size:12px;text-transform:uppercase;color:#ff474f;">Prayer Intentions</p><p style="margin:0;font-size:13px;color:#444;">' + data.prayer_intentions + '</p></div>' : '',
      data.thanksgiving ? '<div style="background:#fff8f8;border-left:3px solid #ff474f;padding:12px 16px;border-radius:4px;margin-bottom:12px;"><p style="margin:0 0 4px;font-weight:bold;font-size:12px;text-transform:uppercase;color:#ff474f;">Thanksgiving</p><p style="margin:0;font-size:13px;color:#444;">' + data.thanksgiving + '</p></div>' : '',
      '<p style="margin:20px 0 0;font-style:italic;color:#888;font-size:13px;">"Give, and it will be given to you." - Luke 6:38</p>',
    ].join(''));
    safeSendEmail(data.user_email, "Offering Receipt - " + amount, receipt, receiptHtml);
  }

  if (data.prayer_intentions || data.thanksgiving) {
    var prayerBody = [
      "A community member has shared their prayer intentions.",
      "",
      "Name: " + firstName + " (first name only)",
      "",
      data.prayer_intentions ? ("PRAYER INTENTIONS:\n" + data.prayer_intentions + "\n") : "",
      data.thanksgiving ? ("THANKSGIVING:\n" + data.thanksgiving + "\n") : "",
      "Please pray for this member.",
    ].join("\n");
    var prayerHtml = buildEmailHtml([
      '<p style="font-size:16px;font-weight:bold;color:#ff474f;margin:0 0 16px;">Prayer Intentions from a Community Member</p>',
      '<p style="margin:0 0 16px;color:#666;">Name: <strong>' + firstName + '</strong> (first name only)</p>',
      data.prayer_intentions ? '<div style="background:#fff8f8;border-left:3px solid #ff474f;padding:12px 16px;border-radius:4px;margin-bottom:12px;"><p style="margin:0 0 4px;font-weight:bold;font-size:12px;text-transform:uppercase;color:#ff474f;">Prayer Intentions</p><p style="margin:0;font-size:14px;color:#1a1a1a;">' + data.prayer_intentions + '</p></div>' : '',
      data.thanksgiving ? '<div style="background:#fff8f8;border-left:3px solid #ff474f;padding:12px 16px;border-radius:4px;margin-bottom:12px;"><p style="margin:0 0 4px;font-weight:bold;font-size:12px;text-transform:uppercase;color:#ff474f;">Thanksgiving</p><p style="margin:0;font-size:14px;color:#1a1a1a;">' + data.thanksgiving + '</p></div>' : '',
      '<p style="margin:20px 0 0;color:#666;font-size:13px;">Please pray for this member.</p>',
    ].join(''));
    safeSendEmail(SUPER_ADMIN_EMAIL, "Prayer Intentions from a Community Member", prayerBody, prayerHtml);
  }
}

function sendServantApplicationNotification(data) {
  var body = [
    "A new servant application has been submitted.",
    "",
    "Name: " + (data.full_name || ""),
    "Ministry: " + (data.ministry || ""),
    "Email: " + (data.user_email || ""),
    data.serve_roles ? ("Roles: " + data.serve_roles) : "",
    data.audition_url ? ("Audition URL: " + data.audition_url) : "",
    "",
    data.why_serve ? ("Why they want to serve:\n" + data.why_serve) : "",
    data.serve_notes ? ("\nAdditional notes:\n" + data.serve_notes) : "",
    "",
    "Review at: https://fom-connect-hub.vercel.app/dashboard/admin/servants",
  ].join("\n");
  safeSendEmail(SUPER_ADMIN_EMAIL, "New Servant Application: " + (data.ministry || ""), body);
}

function sendPrayerRequestNotification(data) {
  var body = [
    "A community member has submitted a prayer request.",
    "",
    "Name: " + (data.full_name || ""),
    "Email: " + (data.email || ""),
    "Contact: " + (data.contact || ""),
    "",
    "Prayer Request:",
    (data.prayer_request || ""),
    "",
    "Please pray for this member.",
  ].join("\n");
  var html = buildEmailHtml([
    '<p style="font-size:16px;font-weight:bold;color:#ff474f;margin:0 0 16px;">Prayer Request</p>',
    '<table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">',
    '<tr><td style="padding:4px 16px 4px 0;font-size:13px;color:#666;">Name</td><td style="padding:4px 0;font-size:13px;font-weight:bold;color:#1a1a1a;">' + (data.full_name || "") + '</td></tr>',
    '<tr><td style="padding:4px 16px 4px 0;font-size:13px;color:#666;">Email</td><td style="padding:4px 0;font-size:13px;color:#1a1a1a;">' + (data.email || "") + '</td></tr>',
    (data.contact ? '<tr><td style="padding:4px 16px 4px 0;font-size:13px;color:#666;">Contact</td><td style="padding:4px 0;font-size:13px;color:#1a1a1a;">' + data.contact + '</td></tr>' : ''),
    '</table>',
    '<div style="background:#fff8f8;border-left:3px solid #ff474f;padding:12px 16px;border-radius:4px;">',
    '<p style="margin:0 0 6px;font-weight:bold;font-size:12px;text-transform:uppercase;color:#ff474f;">Prayer Request</p>',
    '<p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;">' + (data.prayer_request || "") + '</p>',
    '</div>',
    '<p style="margin:20px 0 0;color:#666;font-size:13px;">Please pray for this member.</p>',
  ].join(''));
  safeSendEmail(SUPER_ADMIN_EMAIL, "Prayer Request from " + (data.full_name || ""), body, html);
}

function sendLgRequestNotification(data) {
  var body = [
    "A new Light Group request has been submitted.",
    "",
    "Name: " + (data.full_name || ""),
    "Email: " + (data.user_email || ""),
    "Contact: " + (data.contact || ""),
    "Age: " + (data.age || ""),
    "Sex: " + (data.sex || ""),
    "Family Ministry: " + (data.family_ministry || ""),
    "Facebook / Messenger: " + (data.messenger_link || ""),
    "",
    "Please reach out to assign this member to a Light Group.",
  ].join("\n");
  safeSendEmail(SUPER_ADMIN_EMAIL, "New Light Group Request: " + (data.full_name || ""), body);
}

// ============================================================
// HELPERS
// ============================================================

function findUserByEmail(sheet, email) {
  if (!email) return null;
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return null;
  var headers = rows[0];
  var emailCol = headers.indexOf("email");
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][emailCol].toString().toLowerCase() === email.toLowerCase()) {
      var obj = rowToObject(headers, rows[i]);
      obj._rowIndex = i + 1;
      return obj;
    }
  }
  return null;
}

function getDefaultSettings() {
  return {
    ftd_date: "",
    ftd_time: "",
    ftd_venue: "",
    ftd_description: "First Timers Day (FTD) is a special gathering for new members of The Feast OLOPSC Marikina. It is an opportunity to learn more about the community and deepen your faith.",
    feast_venue: "DS Hall, Our Lady of Perpetual Succor College, Gen. Ordoñez St., Concepcion, Marikina City",
    feast_time: "Every Sunday 10:00 AM",
  };
}

function rowToObject(headers, row) {
  var obj = {};
  for (var j = 0; j < headers.length; j++) {
    obj[headers[j]] = row[j] !== undefined ? row[j].toString() : "";
  }
  return obj;
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  // Add headers if missing — covers manually pre-created empty sheets
  var firstCell = sheet.getLastRow() > 0 ? sheet.getRange(1, 1).getValue().toString() : "";
  if (firstCell !== headers[0]) {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    var range = sheet.getRange(1, 1, 1, headers.length);
    range.setBackground("#ff474f");
    range.setFontColor("#ffffff");
    range.setFontWeight("bold");
    sheet.setFrozenRows(1);
  } else {
    // Sheet already has headers — add any new columns that are missing
    var lastCol = sheet.getLastColumn();
    var existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return h.toString(); });
    headers.forEach(function(h) {
      if (existingHeaders.indexOf(h) < 0) {
        lastCol++;
        var newCell = sheet.getRange(1, lastCol);
        newCell.setValue(h);
        newCell.setBackground("#ff474f");
        newCell.setFontColor("#ffffff");
        newCell.setFontWeight("bold");
        existingHeaders.push(h);
      }
    });
  }
  return sheet;
}

function safeSendEmail(to, subject, body, htmlBody) {
  try {
    if (!to || to.indexOf("@") < 0) return;
    var opts = { to: to, subject: "[FOM] " + subject, body: body };
    if (htmlBody) opts.htmlBody = htmlBody;
    MailApp.sendEmail(opts);
    logEmail(to, subject);
  } catch (err) {
    Logger.log("Email failed to " + to + ": " + err.toString());
  }
}

function buildEmailHtml(bodyHtml) {
  return [
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>',
    '<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">',
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">',
    '<tr><td align="center">',
    '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">',
    '<tr><td style="background:#ff474f;padding:24px 32px;text-align:center;">',
    '<p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">The Feast</p>',
    '<p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.85);font-weight:normal;">OLOPSC Marikina</p>',
    '</td></tr>',
    '<tr><td style="padding:32px;color:#1a1a1a;font-size:14px;line-height:1.7;">',
    bodyHtml,
    '</td></tr>',
    '<tr><td style="background:#fafafa;padding:16px 32px;text-align:center;border-top:1px solid #f0f0f0;">',
    '<p style="margin:0;font-size:11px;color:#999;">FOM Connect Hub &middot; The Feast OLOPSC Marikina</p>',
    '<p style="margin:4px 0 0;font-size:11px;color:#bbb;">Gen. Ordoñez St., Concepcion, Marikina City</p>',
    '</td></tr>',
    '</table></td></tr></table></body></html>',
  ].join('');
}

function logEmail(recipient, subject) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateSheet(ss, SHEETS.EMAIL_LOG, ["Timestamp", "Recipient", "Subject"]);
    sheet.appendRow([new Date().toISOString(), recipient, subject]);
  } catch (err) {}
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
