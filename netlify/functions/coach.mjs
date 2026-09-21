export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed",{status:405});
  const key=Netlify.env.get("OPENAI_API_KEY");
  if(!key) return Response.json({error:"AI coach is not configured yet."},{status:503});
  try{
    const {mode="conversation",text="",history=[],level="B1",mistakes=[]}=await req.json();
    const instructions=mode==="writing"
      ? "You are an English writing coach for a Spanish-speaking adult professional. Correct the user's English, explain briefly in simple Spanish, give a more natural English version, and identify at most 2 reusable error patterns. Be concise."
      : "You are an English conversation coach for a Spanish-speaking adult professional. Continue the conversation naturally in English. Do not interrupt for every error. Add a short Spanish feedback note only when useful, and identify at most 2 recurring error patterns. Keep the conversation moving.";
    const input=JSON.stringify({learner_level:level,known_mistakes:mistakes,recent_history:history.slice(-6),user_text:text});
    const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model:"gpt-5.4-mini",instructions,input})});
    const data=await r.json();
    if(!r.ok) return Response.json({error:data?.error?.message||"AI request failed"},{status:r.status});
    return Response.json({text:data.output_text||""});
  }catch(e){return Response.json({error:"Could not process this coaching request."},{status:500})}
};