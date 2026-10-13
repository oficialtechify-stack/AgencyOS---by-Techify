import test from 'node:test';
import assert from 'node:assert/strict';
import { hermesAvailability,hermesReply } from './hermesConnector';
import type { AgencyIdentity } from './copilotAuth';

const owner:AgencyIdentity={uid:'agency-owner',ownerUid:'agency-owner',role:'owner',
 agencyName:'Agência teste',modules:[],email:'owner@example.test',displayName:'Admin'};
const employee:AgencyIdentity={...owner,uid:'employee-123',role:'employee',modules:['social-hub']};

test('Hermes is disabled until separate private gateway credentials are configured',()=>{
 const backup=[process.env.HERMES_AGENT_URL,process.env.HERMES_AGENT_API_KEY,process.env.HERMES_AGENCY_OWNER_UID];
 try{
  delete process.env.HERMES_AGENT_URL;delete process.env.HERMES_AGENT_API_KEY;delete process.env.HERMES_AGENCY_OWNER_UID;
  assert.equal(hermesAvailability(owner).available,false);
  process.env.HERMES_AGENT_URL='http://127.0.0.1:8642';
  process.env.HERMES_AGENT_API_KEY='local-secret';
  process.env.HERMES_AGENCY_OWNER_UID='agency-owner';
  assert.equal(hermesAvailability(owner).available,false);
 }finally{
  ['HERMES_AGENT_URL','HERMES_AGENT_API_KEY','HERMES_AGENCY_OWNER_UID'].forEach((name,i)=>{
   if(backup[i]===undefined)delete process.env[name];else process.env[name]=backup[i];
  });
 }
});
test('Hermes bridge is restricted to verified owner and never shares tenant sessions',async()=>{
 const backup=[process.env.HERMES_AGENT_URL,process.env.HERMES_AGENT_API_KEY,process.env.HERMES_AGENCY_OWNER_UID];
 const previousFetch=globalThis.fetch;
 try{
  process.env.HERMES_AGENT_URL='https://hermes-agency.example.org';
  process.env.HERMES_AGENT_API_KEY='test-private-key';
  process.env.HERMES_AGENCY_OWNER_UID='agency-owner';
  assert.equal(hermesAvailability(owner).available,true);
  assert.equal(hermesAvailability(employee).available,false);
  assert.equal(hermesAvailability({...owner,uid:'another-owner',ownerUid:'another-owner'}).available,false);
  let seen=false;
  globalThis.fetch=async(input,opts)=>{
   seen=true;
   assert.equal(String(input),'https://hermes-agency.example.org/v1/chat/completions');
   assert.equal(new Headers(opts?.headers).get('Authorization'),'Bearer test-private-key');
   const body=JSON.parse(String(opts?.body));
   assert.equal(body.model,'hermes-agent');
   assert.equal(body.stream,false);
   assert.equal(body.messages[0].role,'system');
   return new Response(JSON.stringify({choices:[{message:{content:'Resposta do Hermes'},finish_reason:'stop'}]}),{status:200});
  };
  const reply=await hermesReply(owner,'Contexto permitido',[{role:'user',content:'Olá'}]);
  assert.equal(seen,true);
  assert.equal(reply.provider,'Hermes Agent');
  assert.equal(reply.text,'Resposta do Hermes');
  await assert.rejects(()=>hermesReply(employee,'x',[{role:'user',content:'x'}]),/administrador proprietário/);
 }finally{
  globalThis.fetch=previousFetch;
  ['HERMES_AGENT_URL','HERMES_AGENT_API_KEY','HERMES_AGENCY_OWNER_UID'].forEach((name,i)=>{
   if(backup[i]===undefined)delete process.env[name];else process.env[name]=backup[i];
  });
 }
});
