/* Game log: the rules record here what the player must read. */
export const say=(s,m,t='info')=>s.log.push({t,m});
