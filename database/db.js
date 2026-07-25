const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'data.json');

function load() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({
      members: {},   // memberId -> { invites, boosts, hasTag, joinedBefore, boostSince }
      invitesCache: {}, // guildId -> { code -> uses }
      tickets: {},   // channelId -> { userId, type, claimedBy }
    }, null, 2));
  }
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function getMember(memberId) {
  const data = load();
  if (!data.members[memberId]) {
    data.members[memberId] = { invites: 0, boosts: 0, hasTag: false, joinedBefore: false };
    save(data);
  }
  return data.members[memberId];
}

function updateMember(memberId, patch) {
  const data = load();
  if (!data.members[memberId]) {
    data.members[memberId] = { invites: 0, boosts: 0, hasTag: false, joinedBefore: false };
  }
  Object.assign(data.members[memberId], patch);
  save(data);
  return data.members[memberId];
}

function getInvitesCache(guildId) {
  const data = load();
  return data.invitesCache[guildId] || {};
}

function setInvitesCache(guildId, cache) {
  const data = load();
  data.invitesCache[guildId] = cache;
  save(data);
}

function setTicket(channelId, info) {
  const data = load();
  data.tickets[channelId] = info;
  save(data);
}

function getTicket(channelId) {
  const data = load();
  return data.tickets[channelId] || null;
}

function deleteTicket(channelId) {
  const data = load();
  delete data.tickets[channelId];
  save(data);
}

function getAllTickets() {
  const data = load();
  return data.tickets;
}

module.exports = {
  load, save,
  getMember, updateMember,
  getInvitesCache, setInvitesCache,
  setTicket, getTicket, deleteTicket, getAllTickets,
};
