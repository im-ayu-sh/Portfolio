export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const formData = await request.json();
        
        // This pulls your hidden Google Script URL from Cloudflare's settings
        const gasUrl = env.GAS_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbzouSr4thBwV1fnfAT9jvCTYf3WgCa5LdpxDBmSkLHlnX7UY5rsJlUtcJ3HPG8aUWze/exec"; 

        const response = await fetch(gasUrl, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();
        return new Response(JSON.stringify(result), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Transmission failed." }), { status: 500 });
    }
}