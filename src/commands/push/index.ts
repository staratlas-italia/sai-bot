import { BigQuery } from "@google-cloud/bigquery";
import { updateMemberNotificationFlag } from "~/queries/updateMemberNotificationFlag";
import { Member, PushCommandStatus } from "~/types";

type Param = {
  bigquery: BigQuery;
  member: Member;
  status: PushCommandStatus;
};

export const push = async ({ bigquery, member, status }: Param) => {
  if (!member) {
    console.log("Member not found");
    return "Non hai l'autorizzazione necessaria per lanciare questo comando";
  }

  switch (status) {
    case "on": {
      if (!member.notifications) {
        const updateResult = await updateMemberNotificationFlag({
          bigquery,
          discordId: member.discord_id,
          value: true,
        });

        if (updateResult) {
          return "Le notifiche sono state ATTIVATE con successo 🚀";
        }

        return "C'è stato un errore imprevisto, riprova più tardi";
      }

      return "Le notifiche sono già attive";
    }
    case "off": {
      if (member.notifications) {
        const disableNotificationResult = await updateMemberNotificationFlag({
          bigquery,
          discordId: member.discord_id,
          value: false,
        });

        if (disableNotificationResult) {
          return "Le notifiche sono state DISATTIVATE con successo";
        }

        return "C'è stato un errore imprevisto, riprova più tardi";
      }

      return "Le notifiche sono già disattivate";
    }
    default: {
      return "Valore non valido, lo status può essere solo on oppure off";
    }
  }
};
