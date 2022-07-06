import { WithId } from "mongodb";
import { updateMemberNotificationFlag } from "~/queries/updateMemberNotificationFlag";
import { PushCommandStatus, User } from "~/types";

type Param = {
  user: WithId<User> | null;
  status: PushCommandStatus;
};

export const push = async ({ user, status }: Param) => {
  if (!user) {
    console.log("Member not found");
    return "Non hai l'autorizzazione necessaria per lanciare questo comando";
  }

  switch (status) {
    case "on": {
      if (!user.notifications) {
        const updateResult = await updateMemberNotificationFlag({
          discordId: user.discordId,
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
      if (user.notifications) {
        const disableNotificationResult = await updateMemberNotificationFlag({
          discordId: user.discordId,
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
