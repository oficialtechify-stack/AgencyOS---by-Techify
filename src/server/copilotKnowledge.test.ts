import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseArea, safeAgencyRow, AREA_COLLECTIONS, COLLECTION_MODULE } from './copilotKnowledge';
test('queries map to relevant AgencyOS domains',()=>{
 assert.equal(chooseArea('Quanto foi o faturamento registrado?'),'finance');
 assert.equal(chooseArea('Tenho leads para ligar?'),'sales');
 assert.equal(chooseArea('Como estão as tarefas?'),'operations');
 assert.equal(chooseArea('Resultados dos anúncios'),'marketing');
 assert.equal(chooseArea('Como está minha equipe?'),'team');
});
test('context strips emails and credentials and has known collection scopes',()=>{
 const row=safeAgencyRow({id:'1',name:'Empresa',revenue:1200,token:'redacted',email:'example@invalid.com'});
 assert.deepEqual(row,{id:'1',name:'Empresa',revenue:1200});
 for(const cols of Object.values(AREA_COLLECTIONS))for(const c of cols) assert.ok(COLLECTION_MODULE[c]);
});
