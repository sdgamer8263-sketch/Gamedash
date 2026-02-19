import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, doc, setDoc, getDoc, collection, addDoc, query, where, onSnapshot, updateDoc } from "./firebase-config.js";

// DOM Elements
const views = ['auth-view', 'dashboard-view', 'create-server-view', 'my-servers-view', 'node-status-view', 'version-checker-view', 'admin-queue-view'];
let currentUser = null;
let userRole = 'user';

// Initialize
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        // Check Role in Database
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
            userRole = userDoc.data().role;
            document.getElementById('username-display').innerText = userDoc.data().email.split('@')[0];
            document.getElementById('role-badge').innerText = userRole.toUpperCase();
            
            if(userRole === 'admin') {
                document.getElementById('admin-menu').classList.remove('hidden');
                document.getElementById('role-badge').classList.replace('bg-gray-700', 'bg-red-600');
            }
        }

        document.getElementById('user-info').classList.remove('hidden');
        document.getElementById('sidebar').classList.remove('hidden');
        document.getElementById('sidebar').classList.add('flex');
        showPage('dashboard');
        loadServers();
        if(userRole === 'admin') loadPendingServers();

    } else {
        currentUser = null;
        document.getElementById('user-info').classList.add('hidden');
        document.getElementById('sidebar').classList.add('hidden');
        document.getElementById('sidebar').classList.remove('flex');
        showPage('auth');
    }
});

// Navigation Logic
window.showPage = (pageId) => {
    views.forEach(v => document.getElementById(v).classList.add('hidden'));
    
    // Auth Check
    if(!currentUser && pageId !== 'auth') return showPage('auth');

    const target = document.getElementById(pageId + '-view');
    if(target) target.classList.remove('hidden');
};

// Auth Logic
let isLoginMode = true;
window.toggleAuth = (mode) => {
    isLoginMode = mode === 'login';
    document.getElementById('tab-login').classList.toggle('border-indigo-500', isLoginMode);
    document.getElementById('tab-login').classList.toggle('border-transparent', !isLoginMode);
    document.getElementById('tab-register').classList.toggle('border-indigo-500', !isLoginMode);
    document.getElementById('tab-register').classList.toggle('border-transparent', isLoginMode);
};

window.handleAuth = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const errorDiv = document.getElementById('auth-error');
    errorDiv.innerText = "Processing...";

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, pass);
        } else {
            // REGISTER LOGIC
            const userCred = await createUserWithEmailAndPassword(auth, email, pass);
            const user = userCred.user;
            
            // Check if first user ever
            const usersSnapshot = await getDoc(doc(db, "metadata", "users_count"));
            let role = 'user';
            
            // If metadata doc doesn't exist, this is the first user -> Admin
            if (!usersSnapshot.exists()) {
                role = 'admin';
                await setDoc(doc(db, "metadata", "users_count"), { count: 1 });
            }

            // Save user data
            await setDoc(doc(db, "users", user.uid), {
                email: email,
                role: role,
                coins: 5,
                joined: new Date()
            });
        }
        errorDiv.innerText = "";
    } catch (error) {
        errorDiv.innerText = error.message;
    }
};

window.logout = () => signOut(auth);

// Server Creation Logic
window.requestServer = async (e) => {
    e.preventDefault();
    const name = document.getElementById('srv-name').value;
    const egg = document.getElementById('srv-egg').value;

    try {
        await addDoc(collection(db, "servers"), {
            owner: currentUser.uid,
            name: name,
            egg: egg,
            status: 'pending', // Admins must approve
            ram: 512,
            disk: 1024,
            node: 'Node-01'
        });
        alert("Server requested! Waiting for Admin approval.");
        showPage('my-servers');
    } catch (err) {
        console.error(err);
    }
};

// Load User Servers
function loadServers() {
    const q = query(collection(db, "servers"), where("owner", "==", currentUser.uid));
    onSnapshot(q, (snapshot) => {
        const list = document.getElementById('server-list');
        list.innerHTML = "";
        snapshot.forEach(doc => {
            const srv = doc.data();
            const div = document.createElement('div');
            div.className = "glass-panel p-4 rounded border-l-4 " + (srv.status === 'active' ? "border-green-500" : "border-yellow-500");
            div.innerHTML = `
                <h3 class="font-bold text-lg">${srv.name}</h3>
                <p class="text-sm text-gray-400">${srv.egg} | ${srv.ram}MB</p>
                <div class="mt-2">
                    ${srv.status === 'active' 
                        ? `<button onclick="openConsole('${doc.id}')" class="bg-indigo-600 px-3 py-1 rounded text-sm">Manage</button>` 
                        : `<span class="text-yellow-400 text-sm"><i class="fas fa-clock"></i> Pending Approval</span>`
                    }
                </div>
            `;
            list.appendChild(div);
        });
    });
}

// Admin Queue Logic
function loadPendingServers() {
    const q = query(collection(db, "servers"), where("status", "==", "pending"));
    onSnapshot(q, (snapshot) => {
        const list = document.getElementById('pending-list');
        list.innerHTML = "";
        snapshot.forEach(doc => {
            const srv = doc.data();
            const div = document.createElement('div');
            div.className = "bg-gray-800 p-4 rounded flex justify-between items-center";
            div.innerHTML = `
                <div>
                    <h4 class="font-bold">${srv.name}</h4>
                    <p class="text-xs text-gray-400">Owner ID: ${srv.owner}</p>
                </div>
                <button onclick="approveServer('${doc.id}')" class="bg-green-600 px-3 py-1 rounded">Approve</button>
            `;
            list.appendChild(div);
        });
    });
}

window.approveServer = async (id) => {
    await updateDoc(doc(db, "servers", id), { status: 'active' });
};

// Build Checker (Visual Fake + Real Logic)
window.checkBuild = () => {
    const v = document.getElementById('version-input').value;
    const res = document.getElementById('build-result');
    res.classList.remove('hidden');
    // Simulation of API call
    const buildNum = Math.floor(Math.random() * 500) + 100;
    res.innerHTML = `Version <b>${v}</b> correlates to Build <b>#${buildNum}</b>`;
};

// Console Logic
window.openConsole = (id) => {
    document.getElementById('server-list').classList.add('hidden');
    document.getElementById('server-console').classList.remove('hidden');
    // In a real app, you would fetch server specific data here
};

window.closeConsole = () => {
    document.getElementById('server-list').classList.remove('hidden');
    document.getElementById('server-console').classList.add('hidden');
};
