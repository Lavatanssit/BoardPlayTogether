const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

const COLLECTIONS = {
  users: 'users',
  games: 'games',
  parties: 'parties'
}

function ok(data) {
  return { code: 0, data }
}
function fail(msg, code = -1) {
  return { code, msg }
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const action = event.action
  const payload = event.payload || {}

  try {
    switch (action) {
      case 'getProfile': return ok(await getProfile(OPENID))
      case 'saveProfile': return ok(await saveProfile(OPENID, payload))
      case 'listMyGames': return ok(await listMyGames(OPENID))
      case 'addGame': return ok(await addGame(OPENID, payload))
      case 'updateGame': return ok(await updateGame(OPENID, payload))
      case 'deleteGame': return ok(await deleteGame(OPENID, payload))
      case 'createParty': return ok(await createParty(OPENID, payload))
      case 'listParties': return ok(await listParties(OPENID))
      case 'getParty': return ok(await getParty(OPENID, payload.id))
      case 'joinParty': return ok(await joinParty(OPENID, payload))
      case 'leaveParty': return ok(await leaveParty(OPENID, payload))
      case 'vote': return ok(await vote(OPENID, payload))
      case 'setResult': return ok(await setResult(OPENID, payload))
      case 'cancelParty': return ok(await cancelParty(OPENID, payload))
      case 'finishParty': return ok(await finishParty(OPENID, payload))
      case 'getStats': return ok(await getStats(OPENID))
      default: return fail('未知操作: ' + action)
    }
  } catch (e) {
    console.error('[api]', action, e)
    return fail(e.message || '服务错误')
  }
}

// ---------- 用户 ----------

async function getProfile(openid) {
  const res = await db.collection(COLLECTIONS.users).doc(openid).get().catch(() => null)
  if (res && res.data) return res.data
  return { _id: openid, nickname: '', avatarUrl: '', createdAt: Date.now() }
}

async function saveProfile(openid, payload) {
  const col = db.collection(COLLECTIONS.users)
  const existing = await col.doc(openid).get().catch(() => null)
  const data = {
    nickname: (payload.nickname || '').slice(0, 30),
    avatarUrl: payload.avatarUrl || '',
    updatedAt: Date.now(),
    createdAt: (existing && existing.data && existing.data.createdAt) || Date.now()
  }
  await col.doc(openid).set({ data })
  return data
}

// ---------- 桌游 ----------

async function listMyGames(openid) {
  const res = await db.collection(COLLECTIONS.games)
    .where({ _openid: openid })
    .orderBy('createdAt', 'desc')
    .limit(1000)
    .get()
  return res.data
}

async function addGame(openid, payload) {
  const name = (payload.name || '').trim()
  if (!name) return fail('请填写桌游名称')
  const now = Date.now()
  const doc = {
    _openid: openid,
    name,
    category: (payload.category || '').slice(0, 20),
    minPlayers: Number(payload.minPlayers) || 0,
    maxPlayers: Number(payload.maxPlayers) || 0,
    duration: (payload.duration || '').slice(0, 20),
    imageFileID: payload.imageFileID || '',
    notes: (payload.notes || '').slice(0, 500),
    createdAt: now,
    updatedAt: now
  }
  const res = await db.collection(COLLECTIONS.games).add({ data: doc })
  return { _id: res._id, ...doc }
}

async function updateGame(openid, payload) {
  const { id } = payload
  const name = (payload.name || '').trim()
  if (!name) return fail('请填写桌游名称')
  const data = {
    name,
    category: (payload.category || '').slice(0, 20),
    minPlayers: Number(payload.minPlayers) || 0,
    maxPlayers: Number(payload.maxPlayers) || 0,
    duration: (payload.duration || '').slice(0, 20),
    imageFileID: payload.imageFileID || '',
    notes: (payload.notes || '').slice(0, 500),
    updatedAt: Date.now()
  }
  await db.collection(COLLECTIONS.games).doc(id).update({ data })
  return { _id: id }
}

async function deleteGame(openid, payload) {
  await db.collection(COLLECTIONS.games).doc(payload.id).remove()
  return { _id: payload.id }
}

// ---------- 聚会 ----------

async function createParty(openid, payload) {
  const title = (payload.title || '').trim()
  if (!title) return fail('请填写聚会标题')
  if (!Number(payload.time)) return fail('请选择聚会时间')

  const me = await getProfile(openid)
  const now = Date.now()
  const doc = {
    _openid: openid,
    creatorOpenid: openid,
    title,
    location: (payload.location || '').slice(0, 100),
    time: Number(payload.time),
    note: (payload.note || '').slice(0, 500),
    status: 'open',
    participants: [{
      openid,
      nickname: me.nickname || '发起人',
      avatarUrl: me.avatarUrl || '',
      joinedAt: now
    }],
    votes: [],
    result: [],
    createdAt: now,
    updatedAt: now
  }
  const res = await db.collection(COLLECTIONS.parties).add({ data: doc })
  return { _id: res._id, ...doc }
}

function decorateForUser(party, openid) {
  return {
    ...party,
    isCreator: party.creatorOpenid === openid,
    isJoined: (party.participants || []).some((p) => p.openid === openid)
  }
}

async function listParties(openid) {
  const res = await db.collection(COLLECTIONS.parties)
    .orderBy('time', 'desc')
    .limit(100)
    .get()
  return res.data.map((p) => decorateForUser(p, openid))
}

async function getParty(openid, id) {
  const res = await db.collection(COLLECTIONS.parties).doc(id).get().catch(() => null)
  if (!res || !res.data) return fail('聚会不存在')
  const party = res.data
  const participants = party.participants || []

  // 汇总所有参与者的桌游（按名称去重）
  const gameMap = {}
  if (participants.length) {
    const openids = participants.map((p) => p.openid)
    const gres = await db.collection(COLLECTIONS.games)
      .where({ _openid: _.in(openids) })
      .limit(1000)
      .get()
    gres.data.forEach((g) => {
      if (!gameMap[g.name]) gameMap[g.name] = { name: g.name, owners: [] }
      const owner = participants.find((p) => p.openid === g._openid)
      gameMap[g.name].owners.push({
        openid: g._openid,
        nickname: owner ? owner.nickname : '未知'
      })
    })
  }
  const gameOptions = Object.values(gameMap).sort((a, b) => a.name.localeCompare(b.name, 'zh'))

  // 票数统计
  const tally = {}
  ;(party.votes || []).forEach((v) => {
    (v.gameNames || []).forEach((name) => {
      tally[name] = (tally[name] || 0) + 1
    })
  })

  const myVote = (party.votes || []).find((v) => v.openid === openid)
  return {
    ...decorateForUser(party, openid),
    gameOptions,
    tally,
    myGameNames: myVote ? myVote.gameNames : [],
    participantCount: participants.length
  }
}

async function joinParty(openid, payload) {
  const id = payload.id
  const res = await db.collection(COLLECTIONS.parties).doc(id).get().catch(() => null)
  if (!res || !res.data) return fail('聚会不存在')
  const party = res.data
  if (party.status !== 'open') return fail('聚会已结束')
  if (party.participants.some((p) => p.openid === openid)) return { _id: id, already: true }

  const me = await getProfile(openid)
  const participant = {
    openid,
    nickname: me.nickname || '朋友',
    avatarUrl: me.avatarUrl || '',
    joinedAt: Date.now()
  }
  await db.collection(COLLECTIONS.parties).doc(id).update({
    data: { participants: _.push([participant]), updatedAt: Date.now() }
  })
  return { _id: id }
}

async function leaveParty(openid, payload) {
  const id = payload.id
  const res = await db.collection(COLLECTIONS.parties).doc(id).get().catch(() => null)
  if (!res || !res.data) return fail('聚会不存在')
  const party = res.data
  if (party.creatorOpenid === openid) return fail('发起人不能退出，请结束或取消聚会')

  const participants = party.participants.filter((p) => p.openid !== openid)
  const votes = (party.votes || []).filter((v) => v.openid !== openid)
  await db.collection(COLLECTIONS.parties).doc(id).update({
    data: { participants, votes, updatedAt: Date.now() }
  })
  return { _id: id }
}

async function vote(openid, payload) {
  const id = payload.id
  const gameNames = (payload.gameNames || []).filter(Boolean)
  const res = await db.collection(COLLECTIONS.parties).doc(id).get().catch(() => null)
  if (!res || !res.data) return fail('聚会不存在')
  const party = res.data
  if (!party.participants.some((p) => p.openid === openid)) return fail('请先加入聚会')
  const me = party.participants.find((p) => p.openid === openid)

  const votes = (party.votes || []).filter((v) => v.openid !== openid)
  votes.push({
    openid,
    nickname: me.nickname,
    avatarUrl: me.avatarUrl,
    gameNames
  })
  await db.collection(COLLECTIONS.parties).doc(id).update({
    data: { votes, updatedAt: Date.now() }
  })
  return { _id: id }
}

async function setResult(openid, payload) {
  const id = payload.id
  const res = await db.collection(COLLECTIONS.parties).doc(id).get().catch(() => null)
  if (!res || !res.data) return fail('聚会不存在')
  if (res.data.creatorOpenid !== openid) return fail('只有发起人可以确定携带桌游')
  await db.collection(COLLECTIONS.parties).doc(id).update({
    data: { result: payload.result || [], updatedAt: Date.now() }
  })
  return { _id: id }
}

async function setStatus(openid, id, status) {
  const res = await db.collection(COLLECTIONS.parties).doc(id).get().catch(() => null)
  if (!res || !res.data) return fail('聚会不存在')
  if (res.data.creatorOpenid !== openid) return fail('只有发起人可以操作')
  await db.collection(COLLECTIONS.parties).doc(id).update({
    data: { status, updatedAt: Date.now() }
  })
  return { _id: id }
}

async function cancelParty(openid, payload) {
  return setStatus(openid, payload.id, 'cancelled')
}

async function finishParty(openid, payload) {
  return setStatus(openid, payload.id, 'finished')
}

// ---------- 统计 ----------

async function getStats(openid) {
  const [gamesCount, partiesRes] = await Promise.all([
    db.collection(COLLECTIONS.games).where({ _openid: openid }).count(),
    db.collection(COLLECTIONS.parties).limit(1000).get()
  ])

  const parties = partiesRes.data
  const created = parties.filter((p) => p.creatorOpenid === openid)
  const participated = parties.filter((p) => (p.participants || []).some((x) => x.openid === openid))

  // 最常出现的桌游
  const gameCount = {}
  const addGame = (name) => {
    if (name) gameCount[name] = (gameCount[name] || 0) + 1
  }
  parties.forEach((p) => {
    ;(p.result || []).forEach(addGame)
    ;(p.votes || []).forEach((v) => (v.gameNames || []).forEach(addGame))
  })
  const topGames = Object.entries(gameCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // 最活跃玩家
  const playerCount = {}
  parties.forEach((p) => {
    ;(p.participants || []).forEach((x) => {
      if (!playerCount[x.openid]) playerCount[x.openid] = { nickname: x.nickname || '未知', count: 0 }
      playerCount[x.openid].count++
    })
  })
  const topPlayers = Object.values(playerCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    myGameCount: gamesCount.total,
    createdCount: created.length,
    participatedCount: participated.length,
    totalParties: parties.length,
    topGames,
    topPlayers
  }
}
