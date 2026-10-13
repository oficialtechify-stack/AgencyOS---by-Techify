import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHyperframesHtml, validateScenes, htmlEscape } from './hyperframesVideo';

const scenes = [{heading:'Especial',caption:'Conheça o serviço',accent:'Marca'},
 {heading:'Mais qualidade',caption:'Crie seu projeto',accent:'Agência'},
 {heading:'Entre em contato',caption:'Agende uma conversa',accent:'CTA'}];

test('creates a HyperFrames video with timed clips, no raw text injection',()=>{
 const doc=buildHyperframesHtml(scenes,'9:16',15,'Roxo premium','Campanha <test>');
 assert.match(doc,/data-composition-id="main"/);
 assert.match(doc,/data-width="1080" data-height="1920"/);
 assert.match(doc,/data-duration="15"/);
 assert.equal((doc.match(/class="clip"/g)||[]).length,3);
 assert.ok(doc.includes('Campanha &lt;test&gt;'));
 assert.ok(!doc.includes('Campanha <test>'));
 assert.match(doc,/gsap\.timeline\(\{paused:true\}\)/);
});

test('scenes sanitize text and reject invalid storyboard',()=>{
 const okay=validateScenes(scenes);
 assert.equal(okay.length,3);
 assert.throws(()=>validateScenes([{heading:'x',caption:'y'}]));
 assert.equal(htmlEscape('<img src=x>'),'&lt;img src=x&gt;');
});
