'use strict';

const { PermissionFlagsBits } = require('discord.js');
const { roles: roleConfig } = require('../config');
const { sleep } = require('./permissions');

const REASON = 'Configuration automatique du serveur (/setup)';
const STEP_DELAY = 300;

function permissionsFrom(names = []) {
  let value = 0n;
  for (const name of names) {
    const flag = PermissionFlagsBits[name];
    if (flag === undefined) {
      throw new Error(`Permission inconnue dans config.js : "${name}"`);
    }
    value |= flag;
  }
  return value;
}

function nameForKey(key) {
  const def = roleConfig.find((role) => role.key === key);
  return def ? def.name : null;
}

/** Retrouve un rôle du serveur à partir de sa clé de config.js. */
async function resolveRole(guild, key) {
  const roleName = nameForKey(key);
  if (!roleName) return null;

  let role = guild.roles.cache.find((candidate) => candidate.name === roleName);
  if (role) return role;

  const roles = await guild.roles.fetch();
  role = roles.find((candidate) => candidate.name === roleName);
  return role ?? null;
}

/** Ajoute à un membre le rôle correspondant à la clé (sans erreur s'il l'a déjà). */
async function addRole(member, key) {
  const role = await resolveRole(member.guild, key);
  if (!role) {
    const roleName = nameForKey(key) ?? key;
    throw new Error(`Le rôle "${roleName}" n'existe pas encore sur le serveur : lance \`/setup roles\`.`);
  }
  if (member.roles.cache.has(role.id)) return role;
  await member.roles.add(role, REASON);
  return role;
}

/** Retire d'un membre le rôle correspondant à la clé (sans erreur s'il ne l'a pas). */
async function removeRole(member, key) {
  const role = await resolveRole(member.guild, key);
  if (!role) return null;
  if (!member.roles.cache.has(role.id)) return role;
  await member.roles.remove(role, REASON);
  return role;
}

/**
 * Crée les rôles manquants. La liste est parcourue du bas vers le haut, car
 * Discord place chaque nouveau rôle en bas de la hiérarchie.
 */
async function createRoles(guild, log = () => {}) {
  await guild.roles.fetch();
  const created = [];
  const skipped = [];

  for (const def of [...roleConfig].reverse()) {
    const existing = guild.roles.cache.find((role) => role.name === def.name);
    if (existing) {
      skipped.push(def.name);
      continue;
    }

    const role = await guild.roles.create({
      name: def.name,
      color: def.color ?? 0,
      hoist: Boolean(def.hoist),
      mentionable: Boolean(def.mentionable),
      permissions: permissionsFrom(def.permissions),
      reason: REASON,
    });

    created.push(role.name);
    log(`rôle créé : ${role.name}`);
    await sleep(STEP_DELAY);
  }

  return { created, skipped };
}

/**
 * Remet la hiérarchie des rôles dans l'ordre de config.js.
 * Les rôles configurés sont placés juste sous le rôle du bot, du premier de la
 * liste (le plus haut) au dernier. Les autres rôles du serveur ne bougent pas.
 * Best-effort : si Discord refuse, on continue sans bloquer le reste.
 */
async function applyHierarchy(guild) {
  const roles = await guild.roles.fetch();

  let top = null;
  try {
    const me = guild.members.me ?? (await guild.members.fetchMe());
    top = me.roles.highest.position - 1;
  } catch (error) {
    console.warn('[rôles] rôle du bot introuvable :', error.message);
    return false;
  }

  if (top === null || top < 1) return false;

  const payload = [];
  let position = top;

  for (const def of roleConfig) {
    if (position < 1) break;
    const role = roles.find((candidate) => candidate.name === def.name);
    if (!role) continue;
    payload.push({ role: role.id, position });
    position -= 1;
  }

  if (payload.length === 0) return false;

  try {
    await guild.roles.setPositions(payload);
    return true;
  } catch (error) {
    console.warn('[rôles] ordre non appliqué :', error.message);
    return false;
  }
}

module.exports = {
  REASON,
  resolveRole,
  addRole,
  removeRole,
  createRoles,
  applyHierarchy,
};
