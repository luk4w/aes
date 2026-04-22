const enc = new TextEncoder();
const dec = new TextDecoder();

async function deriveKey(password, salt) {
    const raw = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        raw,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

async function encrypt(plaintext, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));
    const out = new Uint8Array(16 + 12 + data.byteLength);
    out.set(salt, 0); out.set(iv, 16); out.set(new Uint8Array(data), 28);
    return btoa(String.fromCharCode(...out));
}

async function decrypt(b64, password) {
    const buf = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const key = await deriveKey(password, buf.slice(0, 16));
    const data = await crypto.subtle.decrypt({ name: "AES-GCM", iv: buf.slice(16, 28) }, key, buf.slice(28));
    return dec.decode(data);
}

async function run(isDecrypt) {
    const input = document.getElementById('input').value.trim();
    const password = document.getElementById('password').value;
    const output = document.getElementById('output');

    if (!input || !password) {
        output.className = 'err';
        output.value = 'fill in both fields.';
        return;
    }

    try {
        output.value = '...';
        output.className = '';
        const result = isDecrypt ? await decrypt(input, password) : await encrypt(input, password);
        output.value = result;
        output.className = 'ok';
    } catch {
        output.value = isDecrypt ? 'wrong password or invalid data.' : 'error encrypting.';
        output.className = 'err';
    }
}

function copy() {
    const val = document.getElementById('output').value;
    if (!val || val === '...') return;
    navigator.clipboard.writeText(val).then(() => {
        const o = document.getElementById('output');
        const prev = o.value;
        o.value = 'copied!';
        setTimeout(() => o.value = prev, 800);
    });
}

document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) run(false);
    if (e.key === 'Enter' && e.shiftKey) run(true);
});