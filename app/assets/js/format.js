export const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const money = n => n == null ? 'Not listed' : '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:Number(n)%1?2:0,maximumFractionDigits:2});
export const date = d => d ? new Date(d).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}) : 'Not listed';
export function remaining(d) { let t=new Date(d).getTime()-Date.now(); if(!Number.isFinite(t)) return 'Not listed'; if(t<=0)return 'Entries closed'; let h=Math.floor(t/3600000),m=Math.floor(t%3600000/60000); return h>=48?`${Math.floor(h/24)}d ${h%24}h left`:`${h}h ${m}m left`; }
export const open = b => b.status === 'open' && (!b.deadline || new Date(b.deadline)>Date.now());
export const fee = n => n == null || Number(n)===0 ? 'Free' : money(n);
export const route = s => '#/bounty/'+encodeURIComponent(s);
