import { GuildMember, GuildMemberRoleManager } from "discord.js";
import { grantedRoles, needsPermissionCommands } from "~/common/constants";
import { Command } from "~/types";

type Param = {
  author: GuildMember;
  commandName: Command;
};

export const checkPermission = ({ author, commandName }: Param) => {
  const memberRoles: GuildMemberRoleManager = author.roles;

  if (
    !memberRoles.cache.some((role) => grantedRoles.includes(role.id)) &&
    needsPermissionCommands.includes(commandName)
  ) {
    return false;
  } else {
    return true;
  }
};
