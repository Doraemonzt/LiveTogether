import test from "node:test";
import assert from "node:assert/strict";
import {SESSIONS,sampleClips,validateClip,coverage} from "../lib/domain.ts";
import {validateSession,sessionKey,findExistingSession,createCommunitySession,includeContributedSongs} from "../lib/sessions.ts";
const draft={artist:"周杰伦",tour:"嘉年华",city:"上海",venue:"体育场",date:"2026-10-07",time:"19:30",night:""};
test("session creation requires real date/time and bounded descriptive fields",()=>{
 assert.equal(validateSession({...draft,artist:"  周杰伦  "}).artist,"周杰伦");
 for(const patch of [{artist:""},{venue:""},{date:"2026-02-30"},{date:"2026-13-01"},{time:"24:00"},{tour:"x".repeat(101)}])assert.throws(()=>validateSession({...draft,...patch}));
});
test("same concert identity tolerates spaces and display labels but separates nights/times/venues",()=>{
 assert.equal(sessionKey(draft),sessionKey({...draft,artist:"周 杰伦"}));
 const row=createCommunitySession(draft,"community-test","u");
 assert.equal(findExistingSession({...draft,tour:"嘉年华世界巡演",night:"第一晚"},[row])?.id,row.id);
 for(const patch of [{date:"2026-10-08"},{time:"14:30"},{venue:"另一个场馆"}])assert.equal(findExistingSession({...draft,...patch},[row]),undefined);
 assert.equal(findExistingSession({...SESSIONS[0]},SESSIONS)?.id,"sh-1002");
});
test("new sessions accept publication and derive their own song coverage without generating sample videos",()=>{
 const session=createCommunitySession(draft,"community-test","u"),clip={...sampleClips()[0],id:"uploaded",sessionId:session.id,songs:["晴天","晴天"],sample:false};
 const rows=includeContributedSongs([...SESSIONS,session],[clip]);
 assert.equal(validateClip(clip,rows).sessionId,session.id);
 assert.deepEqual(rows.at(-1)?.songs,["晴天"]);
 assert.equal(coverage([clip],session.id,rows).filter(c=>c.clip).length,1);
 assert.equal(sampleClips().some(c=>c.sessionId===session.id),false);
 assert.throws(()=>validateClip({...clip,sessionId:"nonexistent"},rows));
});
