import { GuildMember, GuildMemberRoleManager } from "discord.js";
import { ROLES, NEED_PERMISSION_COMMANDS } from "~/common/constants";

type Param = {
  author: GuildMember;
  commandName: string;
};

export const checkPermission = ({ author, commandName }: Param) => {
  const memberRoles: GuildMemberRoleManager = author.roles;

  if (
    !memberRoles.cache.some((role) => ROLES.includes(role.id)) &&
    NEED_PERMISSION_COMMANDS.includes(commandName)
  ) {
    console.log("Needed role not found");
    return false;
  } else {
    return true;
  }
};
