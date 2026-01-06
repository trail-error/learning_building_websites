const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const moment = require("moment-business-days");

const prisma = new PrismaClient();

// Function to send SLA reminder notifications
async function sendSlaReminderNotifications() {
  try {
    console.log("🔔 Starting SLA reminder notification check at", new Date().toISOString());
    
    const today = new Date();
    const threeDaysFromNow = moment(today).businessAdd(3).toDate();
    
    // Get all active pods that are due within 3 business days
    const podsDueSoon = await prisma.pod.findMany({
      where: {
        isHistory: false,
        isDeleted: false,
        slaCalculatedNbd: {
          not: null,
          gte: today,
          lte: threeDaysFromNow
        },
        assignedEngineer: {
          not: "",   // since it's `NOT NULL` text
        },
      },
      select: {
        id: true,
        pod: true,
        assignedEngineer: true,
        slaCalculatedNbd: true,
        status: true,
        subStatus: true
      }
    });

    console.log(`📊 Found ${podsDueSoon.length} pods due within 3 business days`);

    // 1. Notify assigned engineers about their pods due soon
    for (const pod of podsDueSoon) {
      if (pod.assignedEngineer) {
        // Find the assigned engineer user
        const assignedUser = await prisma.user.findFirst({
          where: {
            email: {
              equals: pod.assignedEngineer.trim()
            }
          }
        });

        if (assignedUser) {
          const daysUntilDue = moment(pod.slaCalculatedNbd).businessDiff(moment(today));
          const message = `⚠️ POD ${pod.pod} is due in ${daysUntilDue} business days (SLA: ${moment(pod.slaCalculatedNbd).format('MMM DD, YYYY')}). Current status: ${pod.status} - ${pod.subStatus}`;
          
          await prisma.notification.create({
            data: {
              userId: assignedUser.id,
              createdForId: assignedUser.id,
              message: message,
              podId: pod.pod,
              createdById: null // System notification
            }
          });

          console.log(`📧 Sent reminder to ${pod.assignedEngineer} for POD ${pod.pod}`);
        }
      }
    }

    // 2. Send daily report to super-admins
    if (podsDueSoon.length > 0) {
      const superAdmins = await prisma.user.findMany({
        where: {
          role: "SUPER_ADMIN"
        },
        select: {
          id: true,
          email: true
        }
      });

      // Create a summary message
      const podList = podsDueSoon.map(pod => {
        const daysUntilDue = moment(pod.slaCalculatedNbd).businessDiff(moment(today));
        return `• POD ${pod.pod} (${pod.assignedEngineer}) - Due in ${daysUntilDue} days (${moment(pod.slaCalculatedNbd).format('MMM DD, YYYY')}) - Status: ${pod.status} - ${pod.subStatus}`;
      }).join('\n');

      const summaryMessage = `📋 Daily SLA Report - ${podsDueSoon.length} PODs due within 3 business days:\n\n${podList}`;

      // Send notification to each super-admin
      for (const admin of superAdmins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            createdForId: admin.id,
            message: summaryMessage,
            createdById: null // System notification
          }
        });

        console.log(`📧 Sent report to super-admin ${admin.email}`);
      }
    } else {
      // Send "no pods due" notification to super-admins
      const superAdmins = await prisma.user.findMany({
        where: {
          role: "SUPER_ADMIN"
        },
        select: {
          id: true,
          email: true
        }
      });

      const noPodsMessage = `📋 Daily SLA Report - No PODs are due within the next 3 business days. All good! ✅`;

      for (const admin of superAdmins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            createdForId: admin.id,
            message: noPodsMessage,
            createdById: null // System notification
          }
        });

        console.log(`📧 Sent "no pods due" report to super-admin ${admin.email}`);
      }
    }

    console.log("✅ SLA reminder notifications completed successfully");
  } catch (error) {
    console.error("❌ Error in SLA reminder notifications:", error);
  }
}

// Prevent duplicate jobs in dev hot-reload
if (!(global).cronStarted) {
  (global).cronStarted = true;

  // Run SLA reminders daily at 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    await sendSlaReminderNotifications();
  });

  // // Check for overdue pods daily at 2:00 PM
  // cron.schedule("0 14 * * *", async () => {
  //   await checkOverduePods();
  // });

  

  console.log("✅ Cron jobs scheduled:");
  console.log("   - SLA reminders: Daily at 9:00 AM");
  console.log("   - Overdue check: Daily at 2:00 PM");
  console.log("   - Heartbeat: Every minute");
}


