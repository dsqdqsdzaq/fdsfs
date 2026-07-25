function accountAge(createdTimestamp) {
  const now = Date.now();
  const diffMs = now - createdTimestamp;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "aujourd'hui";
  if (diffDays === 1) return 'il y a 1 jour';
  if (diffDays < 30) return `il y a ${diffDays} jours`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return diffMonths === 1 ? 'il y a 1 mois' : `il y a ${diffMonths} mois`;
  }

  const diffYears = Math.floor(diffDays / 365);
  return diffYears === 1 ? 'il y a 1 an' : `il y a ${diffYears} ans`;
}

function ordinal(n) {
  return n === 1 ? '1ère' : `${n}e`;
}

function hasStaffRole(member, staffRoleIds) {
  if (!staffRoleIds || staffRoleIds.length === 0) return false;
  return staffRoleIds.some((id) => member.roles.cache.has(id));
}

function isModerator(member, modRoleIds) {
  if (modRoleIds && modRoleIds.length > 0) {
    if (modRoleIds.some((id) => member.roles.cache.has(id))) return true;
  }
  return (
    member.permissions.has('BanMembers') ||
    member.permissions.has('KickMembers') ||
    member.permissions.has('ManageMessages') ||
    member.permissions.has('ModerateMembers') ||
    member.permissions.has('Administrator')
  );
}

module.exports = { accountAge, ordinal, hasStaffRole, isModerator };
