"use client";

import React, { useState, useRef, useEffect } from "react";
import { resolvePath, fs, fileContents, saveFs } from "@/lib/MockFs";
import { useDraggable } from "@/hooks/useDraggable";

export default function TerminalApp({ onClose, onMinimize, onMaximize, isMaximized, isMinimized, zIndex, onFocus, terminalUser = "root", terminalHost = "ubuntu", terminalTextColor = "#ffffff" }: any) {
    const [currentDir, setCurrentDir] = useState("/root");
    const [history, setHistory] = useState<{ id: number, content: React.ReactNode }[]>([]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [inputStr, setInputStr] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const { position, handleMouseDown, isDragging, isSnapped } = useDraggable(isMaximized);

    const displayPath = currentDir.replace("/root", "~");

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [history]);

    useEffect(() => {
        const savedHistory = localStorage.getItem("ubuntu_commandHistory");
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                setCommandHistory(parsed);
                setHistoryIndex(parsed.length);
            } catch (e) { }
        }
    }, []);

    useEffect(() => {
        if (commandHistory.length > 0) {
            localStorage.setItem("ubuntu_commandHistory", JSON.stringify(commandHistory));
        }
    }, [commandHistory]);

    const print = (content: React.ReactNode) => {
        setHistory(prev => [...prev, { id: Date.now() + Math.random(), content }]);
    };

    // Helper: split by char outside quotes
    const splitOutside = (str: string, ch: string): string[] => {
        const res: string[] = []; let cur = ''; let inS = false, inD = false;
        for (let i = 0; i < str.length; i++) {
            const c = str[i];
            if (c === "'" && !inD) { inS = !inS; cur += c; }
            else if (c === '"' && !inS) { inD = !inD; cur += c; }
            else if (c === ch && !inS && !inD) { res.push(cur); cur = ''; }
            else cur += c;
        }
        res.push(cur); return res;
    };

    // Helper: run a command segment and return plain text (for piping/redirection)
    const getTextOut = (seg: string, stdin?: string): string => {
        const p = seg.trim().match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
        const c = p[0]; const a = p.slice(1).map((x: string) => x.replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
        const resolveFile = (name: string) => fileContents[resolvePath(currentDir, name)];
        switch (c) {
            case 'echo': return a.join(' ');
            case 'cat': { if (stdin !== undefined) return stdin; if (!a[0]) return ''; return resolveFile(a[0]) ?? `cat: ${a[0]}: No such file or directory`; }
            case 'grep': { const src = stdin ?? (a[1] ? resolveFile(a[1]) ?? '' : ''); const ci = a.includes('-i'); const pat = a.find((x: string) => !x.startsWith('-')) ?? ''; return src.split('\n').filter((l: string) => ci ? l.toLowerCase().includes(pat.toLowerCase()) : l.includes(pat)).join('\n'); }
            case 'sort': { const src = stdin ?? (a.find((x: string) => !x.startsWith('-')) ? resolveFile(a.find((x: string) => !x.startsWith('-'))!) ?? '' : ''); const lines = src.split('\n').sort(); return a.includes('-r') ? lines.reverse().join('\n') : lines.join('\n'); }
            case 'head': { const nf = a.indexOf('-n'); const n = nf >= 0 ? parseInt(a[nf + 1]) || 10 : 10; const fa = a.find((x: string) => !x.startsWith('-')); const src = stdin ?? (fa ? resolveFile(fa) ?? '' : ''); return src.split('\n').slice(0, n).join('\n'); }
            case 'tail': { const nf = a.indexOf('-n'); const n = nf >= 0 ? parseInt(a[nf + 1]) || 10 : 10; const fa = a.find((x: string) => !x.startsWith('-')); const src = stdin ?? (fa ? resolveFile(fa) ?? '' : ''); return src.split('\n').slice(-n).join('\n'); }
            case 'wc': { const src = stdin ?? (a[0] ? resolveFile(a[0]) ?? '' : ''); const lines = src.split('\n').length; const words = src.split(/\s+/).filter((w: string) => w).length; const bytes = new TextEncoder().encode(src).length; return `  ${lines}  ${words} ${bytes}`; }
            case 'uniq': return (stdin ?? '').split('\n').filter((l: string, i: number, ar: string[]) => i === 0 || l !== ar[i - 1]).join('\n');
            case 'tr': { if (a.length < 2) return stdin ?? ''; let r = stdin ?? ''; for (let i = 0; i < a[0].length; i++) r = r.split(a[0][i]).join(a[1][i] ?? ''); return r; }
            case 'cut': { const df = a.indexOf('-d'); const ff = a.indexOf('-f'); const delim = df >= 0 ? a[df + 1] : ' '; const field = ff >= 0 ? (parseInt(a[ff + 1]) - 1) : 0; return (stdin ?? '').split('\n').map((l: string) => l.split(delim)[field] ?? '').join('\n'); }
            case 'tee': { if (a[0] && stdin !== undefined) { fileContents[resolvePath(currentDir, a[0])] = stdin; saveFs(); } return stdin ?? ''; }
            case 'pwd': return currentDir;
            case 'date': return new Date().toString();
            case 'ls': { const t = resolvePath(currentDir, a[0]); return fs[t] ? fs[t].join('\n') : ''; }
            case 'diff': { const c1 = a[0] ? resolveFile(a[0]) ?? '' : ''; const c2 = a[1] ? resolveFile(a[1]) ?? '' : ''; if (c1 === c2) return '(files are identical)'; return c1.split('\n').map((l: string, i: number) => l !== c2.split('\n')[i] ? `< ${l}\n> ${c2.split('\n')[i] ?? ''}` : ``).filter((x: string) => x).join('\n'); }
            default: return '';
        }
    };

    const handleCommand = (cmdStr: string) => {
        // Add the prompt with the command to history
        print(
            <div>
                <span className="prompt"><span className="user">{terminalUser}@{terminalHost}</span>:<span className="path">{displayPath}</span>#</span> {cmdStr}
            </div>
        );

        // --- Piping: cmd1 | cmd2 | cmd3 ---
        const pipeParts = splitOutside(cmdStr, '|');
        if (pipeParts.length > 1) {
            let out = '';
            for (const seg of pipeParts) out = getTextOut(seg.trim(), out || undefined);
            if (out) print(<div style={{ whiteSpace: 'pre-wrap' }}>{out}</div>);
            return;
        }

        // --- Append redirect: cmd >> file ---
        const appIdx = cmdStr.indexOf('>>');
        if (appIdx !== -1) {
            const cp = cmdStr.slice(0, appIdx).trim(), fp = cmdStr.slice(appIdx + 2).trim();
            if (fp) { const t = resolvePath(currentDir, fp); fileContents[t] = (fileContents[t] ?? '') + getTextOut(cp) + "\n"; saveFs(); return; }
        }

        // --- Output redirect: cmd > file ---
        const redIdx = (() => { for (let i = cmdStr.length - 1; i >= 0; i--) if (cmdStr[i] === '>' && cmdStr[i - 1] !== '>') return i; return -1; })();
        if (redIdx !== -1) {
            const cp = cmdStr.slice(0, redIdx).trim(), fp = cmdStr.slice(redIdx + 1).trim();
            if (fp && cp && !cp.endsWith('>')) {
                const t = resolvePath(currentDir, fp); fileContents[t] = getTextOut(cp);
                const par = t.split('/'); const fname = par.pop()!; const pdir = par.join('/') || '/';
                if (fs[pdir] && !fs[pdir].includes(fname)) fs[pdir].push(fname);
                saveFs(); return;
            }
        }

        const parts = cmdStr.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
        const cmd = parts[0];
        const args = parts.slice(1).map(arg => arg.replace(/^"|"$/g, "").replace(/^'|'$/g, ""));

        if (!cmd) return;

        // Mock Commands mapping

        const cmds: Record<string, (args: string[]) => React.ReactNode | null> = {
            help: () => (
                <div style={{ whiteSpace: "pre-wrap" }}>
                    {`Click the book icon in the top right to open the command reference sidebar!\nAlso supporting simulated commands: ls, pwd, cd, mkdir, touch, cat, echo, clear, whoami, date, history, neofetch, apt, top, ifconfig, ping, nmap`}
                </div>
            ),
            clear: () => { setHistory([]); return null; },
            pwd: () => currentDir,
            whoami: () => terminalUser,
            date: () => new Date().toString(),
            ls: (args) => {
                const target = resolvePath(currentDir, args[0]);
                if (fs[target]) return fs[target].join("  ");
                if (fileContents[target] !== undefined) return target.split("/").pop();
                return `ls: cannot access '${target}': No such file or directory`;
            },
            cd: (args) => {
                const target = resolvePath(currentDir, args[0] || "~");
                if (fs[target]) {
                    setCurrentDir(target); // This fixes the cd prompt bug by updating React state natively!
                    return <span style={{ color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>Switched to {target}</span>;
                }
                if (fileContents[target] !== undefined) return `cd: ${target}: Not a directory`;
                return `cd: ${target}: No such file or directory`;
            },
            cat: (args) => {
                if (!args[0]) return "cat: missing operand";
                const target = resolvePath(currentDir, args[0]);
                if (fileContents[target] !== undefined) return <div style={{ whiteSpace: "pre-wrap" }}>{fileContents[target]}</div>;
                if (fs[target]) return `cat: ${target}: Is a directory`;
                return `cat: ${target}: No such file or directory`;
            },
            mkdir: (args) => {
                if (!args[0]) return "mkdir: missing operand";
                const target = resolvePath(currentDir, args[0]);
                if (fs[target] || fileContents[target] !== undefined) return `mkdir: cannot create directory '${args[0]}': File exists`;
                const targetParts = target.split("/");
                const newDir = targetParts.pop()!;
                const parentDir = targetParts.join("/") || "/";
                if (fs[parentDir]) {
                    fs[parentDir].push(newDir);
                    fs[target] = [];
                    saveFs();
                    return null;
                }
                return `mkdir: cannot create directory '${args[0]}': No such file or directory`;
            },
            touch: (args) => {
                if (!args[0]) return "touch: missing file operand";
                const target = resolvePath(currentDir, args[0]);
                if (fs[target] || fileContents[target] !== undefined) return null;
                const targetParts = target.split("/");
                const newFile = targetParts.pop()!;
                const parentDir = targetParts.join("/") || "/";
                if (fs[parentDir]) {
                    fs[parentDir].push(newFile);
                    fileContents[target] = "";
                    saveFs();
                    return null;
                }
                return `touch: cannot touch '${args[0]}': No such file or directory`;
            },
            rmdir: (args) => {
                if (!args[0]) return "rmdir: missing operand";
                const target = resolvePath(currentDir, args[0]);
                if (!fs[target]) {
                    if (fileContents[target] !== undefined) return `rmdir: failed to remove '${args[0]}': Not a directory`;
                    return `rmdir: failed to remove '${args[0]}': No such file or directory`;
                }
                if (fs[target].length > 0 && !args.includes('-r') && !args.includes('--recursive')) {
                    return `rmdir: failed to remove '${args[0]}': Directory not empty (use rm -r to remove non-empty dirs)`;
                }
                // Remove from parent
                const targetParts = target.split("/");
                const dirName = targetParts.pop()!;
                const parentDir = targetParts.join("/") || "/";
                if (fs[parentDir]) {
                    fs[parentDir] = fs[parentDir].filter(f => f !== dirName);
                    delete fs[target];
                    saveFs();
                    return null;
                }
                return `rmdir: failed to remove '${args[0]}': Permission denied`;
            },
            rm: (args) => {
                if (!args[0]) return "rm: missing operand";
                const flags = args.filter(a => a.startsWith('-'));
                const targets = args.filter(a => !a.startsWith('-'));
                const recursive = flags.some(f => f.includes('r') || f.includes('R'));

                for (const arg of targets) {
                    const target = resolvePath(currentDir, arg);
                    if (fs[target] !== undefined) {
                        if (!recursive) return `rm: cannot remove '${arg}': Is a directory (use rm -r)`;
                        // Recursively delete
                        const toDelete = Object.keys(fs).filter(p => p === target || p.startsWith(target + '/'));
                        toDelete.forEach(p => { delete fs[p]; });
                        const targetParts = target.split("/");
                        const dirName = targetParts.pop()!;
                        const parentDir = targetParts.join("/") || "/";
                        if (fs[parentDir]) fs[parentDir] = fs[parentDir].filter(f => f !== dirName);
                    } else if (fileContents[target] !== undefined) {
                        delete fileContents[target];
                        const targetParts = target.split("/");
                        const fileName = targetParts.pop()!;
                        const parentDir = targetParts.join("/") || "/";
                        if (fs[parentDir]) fs[parentDir] = fs[parentDir].filter(f => f !== fileName);
                    } else {
                        return `rm: cannot remove '${arg}': No such file or directory`;
                    }
                }
                saveFs();
                return null;
            },
            echo: (args) => args.join(" "),
            history: () => (
                <div style={{ whiteSpace: "pre-wrap" }}>
                    {commandHistory.concat(cmdStr).map((c, i) => `  ${i + 1}  ${c}`).join("\n")}
                </div>
            ),
            sudo: (args) => {
                if (!args.length) return "usage: sudo -h | -K | -k | -V";
                return `[sudo] password for ${terminalUser}: \nSorry, user ${terminalUser} is not allowed to execute '${args.join(" ")}' as root on ${terminalHost}.`;
            },
            apt: (args) => {
                if (args[0] === "update") return "Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease\nReading package lists... Done\nBuilding dependency tree... Done\nAll packages are up to date.";
                if (args[0] === "install" && args[1]) return `Reading package lists... Done\nBuilding dependency tree... Done\nE: Could not open lock file /var/lib/dpkg/lock-frontend - open (13: Permission denied)\nE: Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend), are you root?`;
                return "apt: command not found";
            },
            top: () => {
                return <div style={{ whiteSpace: "pre-wrap" }}>{`top - 12:45:00 up 1 day,  2:30,  1 user,  load average: 0.00, 0.01, 0.05
Tasks:  80 total,   1 running,  79 sleeping,   0 stopped,   0 zombie
%Cpu(s):  1.0 us,  2.5 sy,  0.0 ni, 96.5 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   7965.0 total,   1234.0 free,   5678.0 used,   1053.0 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   1234.0 avail Mem`}</div>;
            },
            ifconfig: () => {
                return <div style={{ whiteSpace: "pre-wrap" }}>{`eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.104  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)
        RX packets 123456  bytes 123456789 (123.4 MB)
        TX packets 654321  bytes 987654321 (987.6 MB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 1234  bytes 123456 (123.4 KB)
        TX packets 1234  bytes 123456 (123.4 KB)`}</div>;
            },
            ping: (args) => {
                const target = args[0] || "8.8.8.8";
                return <div style={{ whiteSpace: "pre-wrap" }}>{`PING ${target} (8.8.8.8) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=117 time=14.2 ms
64 bytes from ${target}: icmp_seq=2 ttl=117 time=15.1 ms
64 bytes from ${target}: icmp_seq=3 ttl=117 time=14.8 ms
64 bytes from ${target}: icmp_seq=4 ttl=117 time=13.9 ms

--- ${target} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 13.9/14.5/15.1/0.4 ms`}</div>;
            },
            nmap: (args) => {
                const target = args[0] || "127.0.0.1";
                return <div style={{ whiteSpace: "pre-wrap" }}>{`Starting Nmap 7.80 ( https://nmap.org ) at ${new Date().toISOString()}
Nmap scan report for ${target}
Host is up (0.00013s latency).
Not shown: 996 closed ports
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
443/tcp  open  https
3306/tcp open  mysql

Nmap done: 1 IP address (1 host up) scanned in 0.15 seconds`}</div>;
            },
            neofetch: () => (
                <div style={{ display: "flex", gap: "30px", color: "inherit", whiteSpace: "pre", alignItems: "center", padding: "10px 0" }}>
                    <div style={{ color: "#e95420", fontWeight: "bold", textShadow: "0 0 5px rgba(233, 84, 32, 0.5)" }}>
                        {`         .-/+oossssoo+/-.               
     \`:+ssssssssssssssssss+:\`          
   -+ssssssssssssssssssyyssss+-        
 .ossssssssssssssssssdMMMNysssso.      
/ssssssssssshdmmNNmmyNMMMMhssssss/     
+ssssssssshmydMMMMMMMNddddyssssssss+    
/sssssssshNMMMyhhyyyyhmNMMMNhssssssss/   
.ssssssssdMMMNhsssssssssshNMMMdssssssss.  
+sssshhhyNMMNyssssssssssssyNMMMysssssss+  
ossyNMMMNyMMhsssssssssssssshmmmhssssssso  
ossyNMMMNyMMhsssssssssssssshmmmhssssssso  
+sssshhhyNMMNyssssssssssssyNMMMysssssss+  
.ssssssssdMMMNhsssssssssshNMMMdssssssss.  
/sssssssshNMMMyhhyyyyhdNMMMNhssssssss/   
+sssssssssdmydMMMMMMMMddddyssssssss+    
/ssssssssssshdmNNNNmyNMMMMhssssss/     
 .ossssssssssssssssssdMMMNysssso.      
   -+sssssssssssssssssyyyssss+-        
     \`:+ssssssssssssssssss+:\`          
         .-/+oossssoo+/-.`}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ color: "#e95420", fontWeight: "bold", fontSize: "1.1em", borderBottom: "1px solid #555", paddingBottom: "4px", marginBottom: "4px" }}>
                            {terminalUser}@{terminalHost}
                        </div>
                        <div><span style={{ color: "#e95420", fontWeight: "bold" }}>OS</span>: Ubuntu 22.04.3 LTS (Web Sim)</div>
                        <div><span style={{ color: "#e95420", fontWeight: "bold" }}>Host</span>: Web Terminal Virtual Machine</div>
                        <div><span style={{ color: "#e95420", fontWeight: "bold" }}>Kernel</span>: 5.15.0-generic-js</div>
                        <div><span style={{ color: "#e95420", fontWeight: "bold" }}>Uptime</span>: 1 min</div>
                        <div><span style={{ color: "#e95420", fontWeight: "bold" }}>Packages</span>: 1842 (dpkg)</div>
                        <div><span style={{ color: "#e95420", fontWeight: "bold" }}>Shell</span>: bash (simulated)</div>
                        <div><span style={{ color: "#e95420", fontWeight: "bold" }}>Resolution</span>: {window.innerWidth}x{window.innerHeight}</div>
                        <div><span style={{ color: "#e95420", fontWeight: "bold" }}>Terminal</span>: React Next.js Simulator</div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "8px" }}>
                            <div style={{ display: "flex" }}>
                                <div style={{ width: "24px", height: "12px", backgroundColor: "#300a24" }} />
                                <div style={{ width: "24px", height: "12px", backgroundColor: "#cc0000" }} />
                                <div style={{ width: "24px", height: "12px", backgroundColor: "#4e9a06" }} />
                                <div style={{ width: "24px", height: "12px", backgroundColor: "#c4a000" }} />
                                <div style={{ width: "24px", height: "12px", backgroundColor: "#3465a4" }} />
                                <div style={{ width: "24px", height: "12px", backgroundColor: "#75507b" }} />
                                <div style={{ width: "24px", height: "12px", backgroundColor: "#06989a" }} />
                                <div style={{ width: "24px", height: "12px", backgroundColor: "#d3d7cf" }} />
                            </div>
                            <div style={{ display: "flex" }}>
                                <div style={{ width: "24px", height: "12px", backgroundColor: "#555753" }} />
                                <div style={{ width: "24px", height: "12px", backgroundColor: "#ef2929" }} />
                                <div style={{ width: "24px", height: "12px", backgroundColor: "#8ae234" }} />
                                <div style={{ width: "24px", height: "12px", backgroundColor: "#fce94f" }} />
                                <div style={{ width: "24px", height: "12px", backgroundColor: "#729fcf" }} />
                                <div style={{ width: "24px", height: "12px", backgroundColor: "#ad7fa8" }} />
                                <div style={{ width: "24px", height: "12px", backgroundColor: "#34e2e2" }} />
                                <div style={{ width: "24px", height: "12px", backgroundColor: "#eeeeec" }} />
                            </div>
                        </div>
                    </div>
                </div>
            )
            ,
            cp: (args) => {
                if (args.length < 2) return "cp: missing destination file operand after source";
                const src = resolvePath(currentDir, args[0]);
                const dst = resolvePath(currentDir, args[1]);
                if (fileContents[src] !== undefined) {
                    let destPath = dst;
                    if (fs[dst]) destPath = `${dst}/${src.split('/').pop()}`;
                    fileContents[destPath] = fileContents[src];
                    const parentParts = destPath.split('/');
                    const fname = parentParts.pop()!;
                    const parentDir = parentParts.join('/') || '/';
                    if (fs[parentDir] && !fs[parentDir].includes(fname)) fs[parentDir].push(fname);
                    saveFs();
                    return null;
                }
                if (fs[src]) return `cp: -r not specified; omitting directory '${args[0]}'`;
                return `cp: cannot stat '${args[0]}': No such file or directory`;
            },
            mv: (args) => {
                if (args.length < 2) return "mv: missing destination file operand after source";
                const src = resolvePath(currentDir, args[0]);
                const dst = resolvePath(currentDir, args[1]);
                if (fileContents[src] !== undefined) {
                    let destPath = dst;
                    if (fs[dst]) destPath = `${dst}/${src.split('/').pop()}`;
                    fileContents[destPath] = fileContents[src];
                    delete fileContents[src];
                    const srcParts = src.split('/');
                    const srcName = srcParts.pop()!;
                    const srcParent = srcParts.join('/') || '/';
                    if (fs[srcParent]) fs[srcParent] = fs[srcParent].filter(f => f !== srcName);
                    const dstParts = destPath.split('/');
                    const dstName = dstParts.pop()!;
                    const dstParent = dstParts.join('/') || '/';
                    if (fs[dstParent] && !fs[dstParent].includes(dstName)) fs[dstParent].push(dstName);
                    saveFs();
                    return null;
                }
                if (fs[src]) return `mv: cannot move directory '${args[0]}': not supported in simulator`;
                return `mv: cannot stat '${args[0]}': No such file or directory`;
            },
            grep: (args) => {
                if (args.length < 2) return "grep: usage: grep [OPTION]... PATTERN [FILE]...";
                const flags = args.filter(a => a.startsWith('-'));
                const nonFlags = args.filter(a => !a.startsWith('-'));
                const pattern = nonFlags[0];
                const file = nonFlags[1];
                if (!file) return `grep: warning: no files specified; searching stdin is not supported`;
                const target = resolvePath(currentDir, file);
                if (fileContents[target] === undefined) return `grep: ${file}: No such file or directory`;
                const lines = fileContents[target].split('\n');
                const caseInsensitive = flags.includes('-i') || flags.includes('-I');
                const matches = lines.filter(l => caseInsensitive ? l.toLowerCase().includes(pattern.toLowerCase()) : l.includes(pattern));
                if (matches.length === 0) return '';
                return <div style={{ whiteSpace: 'pre-wrap', color: '#7ec8e3' }}>{matches.join('\n')}</div>;
            },
            find: (args) => {
                const base = args[0] ? resolvePath(currentDir, args[0]) : currentDir;
                const nameFlag = args.indexOf('-name');
                const pattern = nameFlag >= 0 ? args[nameFlag + 1] : null;
                const results: string[] = [];
                const allPaths = [...Object.keys(fs), ...Object.keys(fileContents)];
                allPaths.forEach(p => {
                    if (p.startsWith(base)) {
                        if (!pattern || p.split('/').pop()?.includes(pattern.replace('*', ''))) {
                            results.push(p);
                        }
                    }
                });
                if (results.length === 0) return 'find: no matches found';
                return <div style={{ whiteSpace: 'pre-wrap' }}>{results.sort().join('\n')}</div>;
            },
            head: (args) => {
                const nFlag = args.indexOf('-n');
                const n = nFlag >= 0 ? parseInt(args[nFlag + 1]) || 10 : 10;
                const fileArg = args.find(a => !a.startsWith('-') && isNaN(Number(a)));
                if (!fileArg) return 'head: missing file operand';
                const target = resolvePath(currentDir, fileArg);
                if (fileContents[target] === undefined) return `head: cannot open '${fileArg}' for reading: No such file or directory`;
                return <div style={{ whiteSpace: 'pre-wrap' }}>{fileContents[target].split('\n').slice(0, n).join('\n')}</div>;
            },
            tail: (args) => {
                const nFlag = args.indexOf('-n');
                const n = nFlag >= 0 ? parseInt(args[nFlag + 1]) || 10 : 10;
                const fileArg = args.find(a => !a.startsWith('-') && isNaN(Number(a)));
                if (!fileArg) return 'tail: missing file operand';
                const target = resolvePath(currentDir, fileArg);
                if (fileContents[target] === undefined) return `tail: cannot open '${fileArg}' for reading: No such file or directory`;
                return <div style={{ whiteSpace: 'pre-wrap' }}>{fileContents[target].split('\n').slice(-n).join('\n')}</div>;
            },
            wc: (args) => {
                if (!args[0]) return 'wc: missing file operand';
                const target = resolvePath(currentDir, args[0]);
                if (fileContents[target] === undefined) return `wc: ${args[0]}: No such file or directory`;
                const content = fileContents[target];
                const lines = content.split('\n').length;
                const words = content.split(/\s+/).filter(w => w).length;
                const bytes = new TextEncoder().encode(content).length;
                return `  ${lines}  ${words} ${bytes} ${args[0]}`;
            },
            sort: (args) => {
                if (!args[0]) return 'sort: missing file operand';
                const target = resolvePath(currentDir, args[0]);
                if (fileContents[target] === undefined) return `sort: cannot open '${args[0]}' for reading: No such file or directory`;
                const sorted = fileContents[target].split('\n').sort().join('\n');
                return <div style={{ whiteSpace: 'pre-wrap' }}>{sorted}</div>;
            },
            df: () => <div style={{ whiteSpace: 'pre-wrap' }}>{`Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   12G   36G  25% /
tmpfs           3.9G     0  3.9G   0% /dev/shm
/dev/sda2       100G   45G   50G  47% /home`}</div>,
            du: (args) => {
                const target = args[0] ? resolvePath(currentDir, args[0]) : currentDir;
                return <div style={{ whiteSpace: 'pre-wrap' }}>{`4.0K\t${target}/readme.txt\n8.0K\t${target}/Documents\n4.0K\t${target}/Downloads\n28K\t${target}`}</div>;
            },
            free: () => <div style={{ whiteSpace: 'pre-wrap' }}>{`              total       used       free     shared  buff/cache   available
Mem:        7965000    5678000    1234000     123456    1053000    1234000
Swap:       2048000          0    2048000`}</div>,
            ps: (args) => {
                const full = args.includes('aux') || args.includes('-aux');
                if (full) return <div style={{ whiteSpace: 'pre-wrap' }}>{`USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1 169988  5412 ?        Ss   10:00   0:02 /sbin/init
root       234  0.0  0.3 548288 12000 ?        Ssl  10:00   0:01 /usr/bin/node
${terminalUser}    1234  0.1  0.2  46020  9000 pts/0    Ss   12:30   0:00 bash
${terminalUser}    1235  0.0  0.1  48640  5000 pts/0    R+   12:31   0:00 ps aux`}</div>;
                return <div style={{ whiteSpace: 'pre-wrap' }}>{`  PID TTY          TIME CMD
 1234 pts/0    00:00:00 bash
 1235 pts/0    00:00:00 ps`}</div>;
            },
            kill: (args) => {
                if (!args[0]) return 'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...';
                return `kill: (${args[args.length - 1]}) - No such process`;
            },
            chmod: (args) => {
                if (args.length < 2) return 'chmod: missing operand';
                const target = resolvePath(currentDir, args[1]);
                if (!fs[target] && fileContents[target] === undefined) return `chmod: cannot access '${args[1]}': No such file or directory`;
                return null; // success, no output
            },
            chown: (args) => {
                if (args.length < 2) return 'chown: missing operand';
                const target = resolvePath(currentDir, args[1]);
                if (!fs[target] && fileContents[target] === undefined) return `chown: cannot access '${args[1]}': No such file or directory`;
                return null;
            },
            ln: (args) => {
                if (args.length < 2) return 'ln: missing destination file operand';
                return `ln: ${args[0]}: hard links to directories are not allowed (simulator)`;
            },
            'ls -la': () => null, // handled by ls
            'ls -l': (args) => {
                const target = resolvePath(currentDir, args[0]);
                const items = fs[target] || fs[currentDir] || [];
                const lines = ['total ' + items.length * 4];
                items.forEach(item => {
                    const ip = `${target}/${item}`;
                    const isDir = !!fs[ip];
                    lines.push(`${isDir ? 'd' : '-'}rwxr-xr-x  1 ${terminalUser} ${terminalUser}  4096 Mar  7 12:00 ${item}`);
                });
                return <div style={{ whiteSpace: 'pre-wrap' }}>{lines.join('\n')}</div>;
            },
            man: (args) => {
                if (!args[0]) return 'What manual page do you want?';
                const manPages: Record<string, string> = {
                    ls: 'NAME\n     ls - list directory contents\nSYNOPSIS\n     ls [OPTION]... [FILE]...\nDESCRIPTION\n     List information about the FILEs (the current directory by default).',
                    cd: 'NAME\n     cd - change the working directory\nSYNOPSIS\n     cd [dir]',
                    mkdir: 'NAME\n     mkdir - make directories\nSYNOPSIS\n     mkdir [OPTION]... DIRECTORY...',
                    rm: 'NAME\n     rm - remove files or directories\nSYNOPSIS\n     rm [OPTION]... [FILE]...\nOPTIONS\n     -r    remove directories and their contents recursively',
                    grep: 'NAME\n     grep - print lines that match patterns\nSYNOPSIS\n     grep [OPTION]... PATTERN [FILE]...',
                    cp: 'NAME\n     cp - copy files and directories\nSYNOPSIS\n     cp SOURCE DEST',
                    mv: 'NAME\n     mv - move (rename) files\nSYNOPSIS\n     mv SOURCE DEST',
                };
                if (manPages[args[0]]) return <div style={{ whiteSpace: 'pre-wrap', color: '#c8e0ff' }}>{manPages[args[0]]}</div>;
                return `No manual entry for ${args[0]}`;
            },
            uname: (args) => {
                if (args.includes('-a')) return `Linux ${terminalHost} 5.15.0-generic-js #1 SMP Wed Jan 1 00:00:00 UTC 2025 x86_64 x86_64 x86_64 GNU/Linux`;
                return 'Linux';
            },
            hostname: () => terminalHost,
            id: () => `uid=0(${terminalUser}) gid=0(${terminalUser}) groups=0(${terminalUser}),4(adm),27(sudo)`,
            env: () => <div style={{ whiteSpace: 'pre-wrap' }}>{`PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nHOME=/root\nUSER=${terminalUser}\nSHELL=/bin/bash\nTERM=xterm-256color\nLANG=en_US.UTF-8`}</div>,
            export: (args) => args.length ? null : null,
            printenv: (args) => {
                const vars: Record<string, string> = { HOME: '/root', USER: terminalUser, SHELL: '/bin/bash', PATH: '/usr/bin:/bin', TERM: 'xterm-256color' };
                if (args[0]) return vars[args[0]] ?? '';
                return <div style={{ whiteSpace: 'pre-wrap' }}>{Object.entries(vars).map(([k, v]) => `${k}=${v}`).join('\n')}</div>;
            },
            curl: (args) => {
                const url = args.find(a => !a.startsWith('-')) || '';
                return `curl: (6) Could not resolve host: ${url.replace(/https?:\/\//, '') || '(no URL)'}  (simulated - no network access)`;
            },
            wget: (args) => {
                const url = args.find(a => !a.startsWith('-')) || '';
                return `--${new Date().toISOString()}--  ${url}\nResolving ${url}... failed: Name or service not known.\nwget: unable to resolve host address '${url}' (simulated)`;
            },
            python3: (args) => {
                if (!args[0]) return 'Python 3.11.2 (simulator) — interactive mode not supported. Use: python3 script.py';
                return 'python3: cannot run scripts in simulator mode';
            },
            node: (args) => {
                if (!args[0]) return 'Welcome to Node.js v20.5.0 (simulator) — interactive mode not supported.';
                return 'node: cannot run scripts in simulator mode';
            },
            bash: () => 'bash: nested shells not supported in simulator',
            sh: () => 'sh: nested shells not supported in simulator',
            exit: () => { return null; },
            'exit 0': () => null,
            // ── General Utility ──
            cal: () => { const d = new Date(); const y = d.getFullYear(); const m = d.getMonth(); const mNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; const first = new Date(y, m, 1).getDay(); const days = new Date(y, m + 1, 0).getDate(); const today = d.getDate(); let cal = `    ${mNames[m]} ${y}\nSu Mo Tu We Th Fr Sa\n`; let row = '   '.repeat(first); for (let day = 1; day <= days; day++) { row += (day === today ? `[${String(day).padStart(2)}]` : String(day).padStart(2)) + ' '; if ((day + first) % 7 === 0) { cal += row.trimEnd() + '\n'; row = ''; } } if (row.trim()) cal += row; return <div style={{ whiteSpace: 'pre', fontFamily: 'monospace' }}>{cal}</div>; },
            tty: () => '/dev/pts/0',
            bc: (args) => { if (!args[0]) return 'bc 1.07.1 — type expressions after bc (basic eval in simulator)'; try { return String(eval(args.join(''))); } catch { return '(syntax error)'; } },
            which: (args) => { if (!args[0]) return 'which: missing argument'; const known = ['ls', 'cd', 'cat', 'grep', 'find', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod', 'chown', 'sort', 'head', 'tail', 'wc', 'df', 'du', 'free', 'ps', 'kill', 'ping', 'curl', 'wget', 'python3', 'node', 'bash', 'man', 'sudo', 'apt', 'which', 'tty', 'cal', 'diff', 'tar']; return known.includes(args[0]) ? `/usr/bin/${args[0]}` : `${args[0]}: not found in PATH`; },
            who: () => <div style={{ whiteSpace: 'pre' }}>{`${terminalUser}   pts/0        ${new Date().toDateString()}  (192.168.1.1)`}</div>,
            w: () => <div style={{ whiteSpace: 'pre' }}>{` ${new Date().toLocaleTimeString()} up 1 day,  2:30,  1 user,  load avg: 0.00\nUSER     TTY   FROM          LOGIN@   IDLE  WHAT\n${terminalUser}   pts/0 192.168.1.1   12:30    0.00s bash`}</div>,
            lp: (args) => args[0] ? `request id is ubuntu-1 (1 file)` : 'Usage: lp <file>',
            lpr: (args) => args[0] ? `lpr: queued ${args[0]} for printing (simulated)` : 'Usage: lpr <file>',
            lpstat: () => 'lpstat: no printers connected (simulator)',
            lpq: () => 'ubuntu is ready\nno entries',
            lprm: (args) => args[0] ? `lprm: request ${args[0]} dequeued` : 'lprm: no request specified',
            cancel: (args) => args[0] ? `cancel: request ${args[0]} cancelled` : 'cancel: no request specified',
            alias: (args) => args[0] ? `alias ${args[0]}='...' set (simulated, not persisted)` : 'No aliases defined.',
            sleep: (args) => args[0] ? null : 'sleep: missing operand',
            // ── File Operations ──
            diff: (args) => { if (args.length < 2) return 'diff: missing operand'; const f1 = resolvePath(currentDir, args[0]); const f2 = resolvePath(currentDir, args[1]); const c1 = fileContents[f1]; const c2 = fileContents[f2]; if (c1 === undefined) return `diff: ${args[0]}: No such file`; if (c2 === undefined) return `diff: ${args[1]}: No such file`; if (c1 === c2) return ''; const l1 = c1.split('\n'); const l2 = c2.split('\n'); const out: string[] = []; for (let i = 0; i < Math.max(l1.length, l2.length); i++) { if (l1[i] !== l2[i]) { if (l1[i] !== undefined) out.push(`< ${l1[i]}`); if (l2[i] !== undefined) out.push(`> ${l2[i]}`); } } return <div style={{ whiteSpace: 'pre-wrap', color: '#f7a8a8' }}>{out.join('\n')}</div>; },
            comm: (args) => { if (args.length < 2) return 'comm: missing operand'; const f1 = resolvePath(currentDir, args[0]); const f2 = resolvePath(currentDir, args[1]); const c1 = fileContents[f1]; const c2 = fileContents[f2]; if (c1 === undefined) return `comm: ${args[0]}: No such file`; if (c2 === undefined) return `comm: ${args[1]}: No such file`; const s1 = new Set(c1.split('\n')); const s2 = new Set(c2.split('\n')); const all = [...new Set([...s1, ...s2])]; const lines = all.map((l: string) => s1.has(l) && !s2.has(l) ? l : !s1.has(l) && s2.has(l) ? `\t\t${l}` : `\t${l}`); return <div style={{ whiteSpace: 'pre' }}>{lines.join('\n')}</div>; },
            cmp: (args) => { if (args.length < 2) return 'cmp: missing operand'; const f1 = resolvePath(currentDir, args[0]); const f2 = resolvePath(currentDir, args[1]); const c1 = fileContents[f1]; const c2 = fileContents[f2]; if (c1 === undefined) return `cmp: ${args[0]}: No such file`; if (c2 === undefined) return `cmp: ${args[1]}: No such file`; if (c1 === c2) return ''; for (let i = 0; i < Math.min(c1.length, c2.length); i++) if (c1[i] !== c2[i]) return `${args[0]} ${args[1]} differ: char ${i + 1}, line ${c1.slice(0, i).split('\n').length}`; return `${args[0]} ${args[1]} differ at end of file`; },
            less: (args) => { if (!args[0]) return 'less: missing file operand'; const t = resolvePath(currentDir, args[0]); if (fileContents[t] === undefined) return `less: ${args[0]}: No such file or directory`; return <div style={{ whiteSpace: 'pre-wrap' }}>{fileContents[t]}<br /><span style={{ color: '#e95420' }}>(END)</span></div>; },
            more: (args) => { if (!args[0]) return 'more: missing file operand'; const t = resolvePath(currentDir, args[0]); if (fileContents[t] === undefined) return `more: ${args[0]}: No such file or directory`; const lines = fileContents[t].split('\n'); return <div style={{ whiteSpace: 'pre-wrap' }}>{lines.slice(0, 20).join('\n')}{lines.length > 20 ? '\n--More--(20%)' : ''}</div>; },
            file: (args) => { if (!args[0]) return 'file: missing operand'; const t = resolvePath(currentDir, args[0]); if (fs[t]) return `${args[0]}: directory`; if (fileContents[t] !== undefined) { const c = fileContents[t]; return c.startsWith('#!/') ? `${args[0]}: a /usr/bin/env script, ASCII text executable` : `${args[0]}: ASCII text`; } return `file: cannot open '${args[0]}': No such file or directory`; },
            type: (args) => { if (!args[0]) return 'type: missing argument'; const builtins = ['cd', 'echo', 'exit', 'history', 'clear', 'export', 'bg', 'fg', 'jobs', 'kill']; const known = ['ls', 'cat', 'grep', 'find', 'mkdir', 'rm', 'cp', 'mv', 'chmod', 'chown', 'sort', 'head', 'tail', 'wc', 'df', 'du', 'free', 'ps', 'ping', 'curl', 'wget', 'python3', 'node', 'bash', 'man', 'sudo', 'apt', 'diff', 'tar', 'which', 'cal']; if (builtins.includes(args[0])) return `${args[0]} is a shell builtin`; if (known.includes(args[0])) return `${args[0]} is /usr/bin/${args[0]}`; return `${args[0]}: not found`; },
            split: (args) => { if (!args[0]) return 'split: missing operand'; const t = resolvePath(currentDir, args[0]); if (fileContents[t] === undefined) return `split: cannot open '${args[0]}': No such file`; const lines = fileContents[t].split('\n'); const chunks = Math.ceil(lines.length / 1000); for (let i = 0; i < chunks; i++) { const suf = String.fromCharCode(97 + Math.floor(i / 26)) + String.fromCharCode(97 + (i % 26)); const op = `${currentDir}/x${suf}`; fileContents[op] = lines.slice(i * 1000, (i + 1) * 1000).join('\n'); if (fs[currentDir] && !fs[currentDir].includes(`x${suf}`)) fs[currentDir].push(`x${suf}`); } saveFs(); return `created ${chunks} part(s)`; },
            tar: (args) => { const f = args.find((a: string) => a.startsWith('-')) || ''; if (f.includes('x')) return 'tar: (simulated) extracting archive...'; if (f.includes('c')) return `tar: (simulated) created ${args.find((a: string) => a.endsWith('.tar') || a.endsWith('.gz')) || 'archive.tar'}`; if (f.includes('t')) return <div style={{ whiteSpace: 'pre' }}>{'archive/\narchive/file1.txt\narchive/readme.md'}</div>; return 'tar: must specify one of -Acdtrux'; },
            gzip: (args) => args[0] ? `gzip: ${args[0]}.gz created (simulated)` : 'Usage: gzip <file>',
            gunzip: (args) => args[0] ? `gunzip: ${args[0]} extracted (simulated)` : 'Usage: gunzip <file>',
            bzip2: (args) => args[0] ? `bzip2: ${args[0]}.bz2 created (simulated)` : 'Usage: bzip2 <file>',
            bunzip2: (args) => args[0] ? `bunzip2: ${args[0]} decompressed (simulated)` : 'Usage: bunzip2 <file>',
            zip: (args) => args.length >= 2 ? `  adding: ${args.slice(1).join(', ')}\n  created: ${args[0]}` : 'Usage: zip <archive> <files...>',
            unzip: (args) => args[0] ? `Archive:  ${args[0]}\n  inflating: file1.txt\n  inflating: file2.txt` : 'Usage: unzip <file>',
            locate: (args) => { if (!args[0]) return 'locate: missing argument'; const q = args[0].toLowerCase(); const res = [...Object.keys(fs), ...Object.keys(fileContents)].filter(p => p.toLowerCase().includes(q)); return res.length ? <div style={{ whiteSpace: 'pre' }}>{res.join('\n')}</div> : `locate: no matches for '${args[0]}'`; },
            vim: (args) => args[0] ? `vim: Hint — use the Text Editor desktop app to open ${args[0]}` : 'vim: use the Text Editor desktop app',
            nano: (args) => args[0] ? `nano: opening ${args[0]} (simulated) — use Text Editor app` : 'nano: use the Text Editor app',
            vi: (args) => args[0] ? `vi: use the Text Editor desktop app for ${args[0]}` : 'vi: use the Text Editor desktop app',
            tr: (args) => args.length < 2 ? 'tr: missing operand' : 'tr: no stdin in direct mode — use: echo text | tr from to',
            uniq: () => 'uniq: no stdin in direct mode — use: cat file | uniq',
            cut: () => 'cut: no stdin in direct mode — use: cat file | cut -d: -f1',
            tee: (args) => args[0] ? `tee: use in a pipe: cmd | tee ${args[0]}` : 'tee: missing file operand',
            xargs: () => 'xargs: no command — use: cmd | xargs target',
            // ── User Management ──
            su: (args) => `Password: \nsu: Authentication failure (simulator — cannot switch to ${args[0] || 'root'})`,
            login: () => 'login: Use the desktop directly (simulator)',
            logout: () => 'logout: not a login shell (simulated)',
            passwd: (args) => `Changing password for ${args[0] || terminalUser}.\nCurrent password: \nNew password: \npasswd: password updated successfully (simulated)`,
            useradd: (args) => {
                const u = args.find((a: string) => !a.startsWith('-')) || '';
                if (!u) return 'useradd: missing username';
                const existing: any[] = JSON.parse(localStorage.getItem('ubuntu_users') || '[]');
                if (existing.find((x: any) => x.username === u)) return `useradd: user '${u}' already exists`;
                existing.push({ username: u, password: 'ubuntu2026', home: `/home/${u}`, shell: '/bin/bash', created: new Date().toISOString() });
                localStorage.setItem('ubuntu_users', JSON.stringify(existing));
                if (!fs[`/home/${u}`]) { fs[`/home/${u}`] = []; saveFs(); }
                return <div style={{ color: '#7cffa4' }}>{`useradd: user '${u}' created\nhome: /home/${u}\npassword: ubuntu2026 (default)`}</div>;
            },
            adduser: (args) => {
                const u = args.find((a: string) => !a.startsWith('-')) || '';
                if (!u) return 'adduser: missing username';
                const existing: any[] = JSON.parse(localStorage.getItem('ubuntu_users') || '[]');
                if (existing.find((x: any) => x.username === u)) return `adduser: user '${u}' already exists`;
                existing.push({ username: u, password: 'ubuntu2026', home: `/home/${u}`, shell: '/bin/bash', created: new Date().toISOString() });
                localStorage.setItem('ubuntu_users', JSON.stringify(existing));
                if (!fs[`/home/${u}`]) { fs[`/home/${u}`] = []; saveFs(); }
                return <div style={{ whiteSpace: 'pre', color: '#7cffa4' }}>{`Adding user '${u}' ...\nCreating home directory '/home/${u}' ...\nAdding user '${u}' to group 'users'\npassword set to 'ubuntu2026' (default)\nNew account created successfully.`}</div>;
            },
            userdel: (args) => {
                const u = args.find((a: string) => !a.startsWith('-')) || '';
                if (!u) return 'userdel: missing operand';
                if (u === 'root') return `userdel: cannot remove root user`;
                const existing: any[] = JSON.parse(localStorage.getItem('ubuntu_users') || '[]');
                const filtered = existing.filter((x: any) => x.username !== u);
                if (filtered.length === existing.length) return `userdel: user '${u}' does not exist`;
                localStorage.setItem('ubuntu_users', JSON.stringify(filtered));
                return <div style={{ color: '#ffaa55' }}>{`userdel: user '${u}' removed`}</div>;
            },
            groupadd: (args) => args[0] ? `groupadd: group '${args[0]}' added (simulated)` : 'groupadd: missing operand',
            groupmod: (args) => args.length >= 2 ? `groupmod: modified (simulated)` : 'groupmod: missing operand',
            groupdel: (args) => args[0] ? `groupdel: group '${args[0]}' removed (simulated)` : 'groupdel: missing operand',
            gpasswd: (args) => args[0] ? `Changing password for group ${args[args.length - 1]} (simulated)` : 'gpasswd: missing operand',
            chage: () => <div style={{ whiteSpace: 'pre' }}>{`Last password change		: Mar 01, 2026\nPassword expires		: never\nAccount expires			: never\nMax days between change		: 99999\nWarning before expiry		: 7`}</div>,
            chgrp: (args) => args.length >= 2 ? null : 'chgrp: missing operand',
            chfn: (args) => `Changing info for ${args[0] || terminalUser}\nFull Name: (simulated)`,
            chsh: () => 'chsh: shell changed to /bin/bash (simulated)',
            // ── Process Management ──
            pstree: () => <div style={{ whiteSpace: 'pre', color: '#7ec8e3' }}>{`init─┬─cron\n     ├─dbus-daemon\n     ├─node───${terminalHost}\n     ├─sshd───bash───pstree\n     └─systemd`}</div>,
            nice: (args) => args[0] ? `running '${args.join(' ')}' with niceness 10 (simulated)` : '0',
            renice: (args) => args.length >= 2 ? `${args[args.length - 1]}: old priority 0, new priority ${args[0]}` : 'renice: missing operand',
            pkill: (args) => args[0] ? `pkill: sent signal to processes matching '${args[args.length - 1]}' (simulated)` : 'pkill: missing operand',
            killall: (args) => args[0] ? `killall: no process found for '${args[0]}' (simulated)` : 'killall: missing operand',
            xkill: () => 'xkill: unable to open display (headless simulator)',
            fg: () => 'fg: no current job',
            bg: () => 'bg: no current job',
            jobs: () => '(no active jobs)',
            pgrep: (args) => { if (!args[0]) return 'pgrep: missing operand'; const n = args[args.length - 1]; return ['bash', 'node', 'init', 'sshd'].includes(n) ? '1234' : `(no pid found for ${n})`; },
            // ── Memory / System ──
            htop: () => <div style={{ whiteSpace: 'pre' }}>{`  CPU[|||||             5%]   Tasks: 45; 1 running\n  Mem[||||||||||||||  1.5G/7.8G]  Load: 0.00 0.01 0.05\n  Swp[                0K/2.0G]   Uptime: 1 day, 02:30\n\n  PID USER  PRI  VIRT   RES  CPU%  MEM%  Command\n 1234 ${terminalUser}  20   46M    9M   0.0   0.1  bash\n    1 root  20  170M    5M   0.0   0.1  init`}</div>,
            vmstat: () => <div style={{ whiteSpace: 'pre' }}>{`procs -----memory------ -swap- --io-- -system- ----cpu----\n r  b   swpd   free  cache   si so   bi  bo  in  cs us sy id\n 1  0      0 1.2M  876K    0  0   10   5  100 200  1  2  97`}</div>,
            dmidecode: (args) => args.includes('-t') || args.includes('--type') ? <div style={{ whiteSpace: 'pre' }}>{`# dmidecode 3.3\nBIOS Information\n\tVendor: QEMU\n\tVersion: 1.13.0\n\tRelease Date: 01/01/2024`}</div> : 'dmidecode: Use: dmidecode -t bios|system|processor|memory',
            sar: () => <div style={{ whiteSpace: 'pre' }}>{`Linux 5.15.0 (${terminalHost})\t${new Date().toDateString()}\n\n12:00 AM  CPU  %user %system %idle\n12:10 AM  all   1.00    2.00  97.00\nAverage:  all   1.00    2.00  97.00`}</div>,
            pagesize: () => '4096',
            // ── Network ──
            traceroute: (args) => { const h = args[0] || '8.8.8.8'; return <div style={{ whiteSpace: 'pre' }}>{`traceroute to ${h}, 30 hops max\n 1  _gateway (192.168.1.1)  0.5 ms\n 2  10.0.0.1              5.1 ms\n 3  * * *\n 4  ${h} (8.8.8.8)       14.2 ms`}</div>; },
            netstat: () => <div style={{ whiteSpace: 'pre' }}>{`Active Internet connections\nProto  Local Address         Foreign Address       State\ntcp    ${terminalHost}:22   192.168.1.2:51234     ESTABLISHED\ntcp    0.0.0.0:80            0.0.0.0:*             LISTEN`}</div>,
            nslookup: (args) => { const h = args[0] || 'example.com'; return <div style={{ whiteSpace: 'pre' }}>{`Server:\t\t8.8.8.8\nNon-authoritative answer:\nName:\t${h}\nAddress: 93.184.216.34`}</div>; },
            whois: (args) => { const d = args[0] || 'example.com'; return <div style={{ whiteSpace: 'pre' }}>{`Domain Name: ${d.toUpperCase()}\nRegistrar: IANA\nCreation Date: 1995-08-14\nExpiration Date: 2024-08-13\nName Server: A.IANA-SERVERS.NET`}</div>; },
            tcpdump: () => <div style={{ whiteSpace: 'pre' }}>{`tcpdump: listening on eth0\n12:30:00 IP 192.168.1.104 > 8.8.8.8: ICMP echo request\n12:30:00 IP 8.8.8.8 > 192.168.1.104: ICMP echo reply\n^C (simulated)`}</div>,
            dig: (args) => { const h = args[0] || 'example.com'; return <div style={{ whiteSpace: 'pre' }}>{`; <<>> DiG 9.18.1 <<>> ${h}\n;; ANSWER SECTION:\n${h}.\t3600\tIN\tA\t93.184.216.34\n;; Query time: 14 msec`}</div>; },
            route: () => <div style={{ whiteSpace: 'pre' }}>{`Kernel IP routing table\nDestination  Gateway      Genmask         Flags Iface\n0.0.0.0      192.168.1.1  0.0.0.0         UG    eth0\n192.168.1.0  0.0.0.0      255.255.255.0   U     eth0`}</div>,
            host: (args) => { const h = args[0] || 'example.com'; return `${h} has address 93.184.216.34\n${h} IPv6 address 2606:2800:220:1:248:1893:25c8:1946`; },
            arp: () => <div style={{ whiteSpace: 'pre' }}>{`Address         HWtype  HWaddress           Iface\n192.168.1.1     ether   aa:bb:cc:dd:ee:ff   eth0\n192.168.1.2     ether   11:22:33:44:55:66   eth0`}</div>,
            iwconfig: () => <div style={{ whiteSpace: 'pre' }}>{`wlan0  IEEE 802.11  ESSID:"UbuntuNet"\n       Mode:Managed  Frequency:2.437 GHz\n       Bit Rate=54 Mb/s  Link Quality=70/70\neth0   no wireless extensions.`}</div>,
            telnet: (args) => `Trying ${args[0] || 'localhost'}...\ntelnet: Connection refused (simulated)`,
            ifplugstatus: () => 'eth0: link beat detected',
            nload: () => <div style={{ whiteSpace: 'pre' }}>{`Device eth0:\nIncoming: Now 8.50 kBit/s  Avg 5.20 kBit/s\nOutgoing: Now 2.10 kBit/s  Avg 1.80 kBit/s`}</div>,
            mail: (args) => args[0] && args[0].includes('@') ? `mail: simulated send to ${args[0]}` : 'No mail.',
            // ── Time / Date ──
            time: (args) => {
                if (!args[0]) return 'usage: time <command>';
                return <div style={{ whiteSpace: 'pre' }}>{`real\t0m0.012s\nuser\t0m0.008s\nsys\t0m0.004s`}</div>;
            },
            datetime: () => {
                const d = new Date();
                return <div style={{ whiteSpace: 'pre' }}>{`Date: ${d.toLocaleDateString()}\nTime: ${d.toLocaleTimeString()}\nFull: ${d.toString()}`}</div>;
            },
            uptime: () => {
                const d = new Date();
                const h = d.getHours().toString().padStart(2, '0');
                const m = d.getMinutes().toString().padStart(2, '0');
                return ` ${h}:${m}:00 up 1 day,  2:30,  1 user,  load average: 0.00, 0.01, 0.05`;
            },
            dmesg: () => <div style={{ whiteSpace: 'pre', fontSize: '13px' }}>{`[    0.000000] Linux version 5.15.0\n[    0.000001] Command line: BOOT_IMAGE=/vmlinuz\n[    0.000100] BIOS-provided physical RAM map\n[    0.500000] PCI: Using configuration type 1\n[    1.000000] NET: Registered protocol family 2\n[    2.300000] eth0: Link is Up - 1Gbps/Full\n[    3.100000] Reached target Graphical Interface.`}</div>,
            lsblk: () => <div style={{ whiteSpace: 'pre' }}>{`NAME   MAJ:MIN  RM   SIZE  RO  TYPE  MOUNTPOINT\nsda      8:0     0    50G   0  disk\n├─sda1   8:1     0    48G   0  part  /\n└─sda2   8:2     0     2G   0  part  [SWAP]\nsr0     11:0     1  1024M   0  rom`}</div>,
            blkid: () => <div style={{ whiteSpace: 'pre' }}>{`/dev/sda1: UUID="abc123-def456" TYPE="ext4" PARTUUID="xyz"\n/dev/sda2: TYPE="swap" PARTUUID="abc"`}</div>,
            iostat: () => <div style={{ whiteSpace: 'pre' }}>{`Linux 5.15.0  ${new Date().toDateString()}\navg-cpu: %user %nice %system %iowait %steal %idle\n          1.00  0.00    2.00    0.00   0.00  97.00\n\nDevice  tps  kB_read/s  kB_wrtn/s  kB_read  kB_wrtn\nsda    5.00      40.00      20.00   500000   250000`}</div>,
            stat: (args) => {
                if (!args[0]) return 'stat: missing operand';
                const t = resolvePath(currentDir, args[0]);
                const isDir = !!fs[t];
                const exists = isDir || fileContents[t] !== undefined;
                if (!exists) return `stat: cannot stat '${args[0]}': No such file or directory`;
                const size = isDir ? 4096 : (fileContents[t]?.length ?? 0);
                return <div style={{ whiteSpace: 'pre' }}>{`  File: ${args[0]}\n  Size: ${size}\nBlocks: 8\nIO Block: 4096  ${isDir ? 'directory' : 'regular file'}\nDevice: fd01h  Inode: 1234567\nAccess: -rw-r--r--\nModify: ${new Date().toString()}`}</div>;
            },
            basename: (args) => args[0] ? args[0].split('/').pop()! : 'basename: missing operand',
            dirname: (args) => { if (!args[0]) return 'dirname: missing operand'; const p = args[0].includes('/') ? args[0].split('/').slice(0, -1).join('/') || '/' : '.'; return p; },
            mktemp: () => { const id = Math.random().toString(36).slice(2, 8); return `/tmp/tmp.${id}`; },
            fuser: (args) => args[0] ? `${args[0]}: 1234 (${terminalUser})` : 'fuser: no file specified',
            readlink: (args) => args[0] ? `readlink: ${args[0]}: cannot readlink (simulator)` : 'readlink: missing operand',
            ldd: (args) => args[0] ? `\tlinux-vdso.so.1 (0x00007ffdc..)\n\tlibc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (simulated)` : 'ldd: missing argument',
            strace: (args) => args[0] ? `execve("${args[0]}", [...], ...) = 0 (simulated)\nfork() = 1235\nwait4(-1, ...) = 1235` : 'strace: missing command',
            watch: (args) => args[0] ? `watch: running '${args.join(' ')}' every 2s (simulated — showing one iteration)\n${args[0]}: (output would appear here)` : 'watch: missing command',
            crontab: (args) => args.includes('-l') ? '# no crontab for ' + terminalUser : 'crontab: use crontab -l to list, crontab -e to edit (simulated)',
            at: () => 'at: simulated job queuing (not functional in simulator)',
            diff3: (args) => args.length >= 3 ? `diff3: 3-way diff between ${args[0]}, ${args[1]}, ${args[2]} (simulated)` : 'diff3: need 3 files',
            rsync: (args) => args.length >= 2 ? `rsync: (simulated) syncing ${args[0]} → ${args[args.length - 1]}` : 'rsync: missing operand',
            scp: (args) => args.length >= 2 ? `scp: (simulated) ${args[0]} → ${args[args.length - 1]}` : 'scp: missing operand',
            ssh: (args) => args[0] ? `ssh: connect to host ${args[0]} port 22: Connection refused (simulated)` : 'usage: ssh [user@]host',
            ip: (args) => {
                if (args[0] === 'addr' || args[0] === 'a') return <div style={{ whiteSpace: 'pre' }}>{`1: lo: <LOOPBACK,UP> mtu 65536\n   link/loopback 00:00:00:00:00:00\n   inet 127.0.0.1/8\n2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500\n   link/ether 08:00:27:4e:66:a1\n   inet 192.168.1.104/24`}</div>;
                if (args[0] === 'route' || args[0] === 'r') return <div style={{ whiteSpace: 'pre' }}>{`default via 192.168.1.1 dev eth0\n192.168.1.0/24 dev eth0 proto kernel`}</div>;
                return 'Usage: ip [addr|route|link]';
            },
            ss: () => <div style={{ whiteSpace: 'pre' }}>{`Netid State  Recv-Q Send-Q  Local Address:Port   Peer Address:Port\ntcp   ESTAB  0      0       192.168.1.104:22    192.168.1.2:51234\ntcp   LISTEN 0      128     0.0.0.0:80          0.0.0.0:*`}</div>,

            // ══ File Operations ══
            tac: (args) => { if (!args[0]) return 'tac: missing file operand'; const t = resolvePath(currentDir, args[0]); if (fileContents[t] === undefined) return `tac: ${args[0]}: No such file`; return <div style={{ whiteSpace: 'pre-wrap' }}>{fileContents[t].split('\n').reverse().join('\n')}</div>; },
            od: (args) => { if (!args[0]) return 'od: missing operand'; const t = resolvePath(currentDir, args[0]); if (fileContents[t] === undefined) return `od: ${args[0]}: No such file`; const bytes = fileContents[t].slice(0, 16).split('').map((c: string) => c.charCodeAt(0).toString(8).padStart(3, '0')); return <div style={{ whiteSpace: 'pre' }}>{`0000000 ${bytes.join(' ')}\n0000020`}</div>; },
            paste: (args) => { if (args.length < 2) return 'paste: missing file operand'; const f1 = (fileContents[resolvePath(currentDir, args[0])] ?? '').split('\n'); const f2 = (fileContents[resolvePath(currentDir, args[1])] ?? '').split('\n'); return <div style={{ whiteSpace: 'pre' }}>{Array.from({ length: Math.max(f1.length, f2.length) }, (_, i) => `${f1[i] ?? ''}\t${f2[i] ?? ''}`).join('\n')}</div>; },
            join: (args) => args.length < 2 ? 'join: missing operand' : `join: (simulated) joining ${args[0]} and ${args[1]}`,
            fold: (args) => { const w = args.includes('-w') ? parseInt(args[args.indexOf('-w') + 1]) || 80 : 80; const f = args.find((a: string) => !a.startsWith('-')); if (!f) return 'fold: missing file'; const t = resolvePath(currentDir, f); if (fileContents[t] === undefined) return `fold: ${f}: No such file`; return <div style={{ whiteSpace: 'pre-wrap' }}>{(fileContents[t].match(new RegExp(`.{1,${w}}`, 'g')) || []).join('\n')}</div>; },
            csplit: (args) => args.length >= 2 ? `csplit: created xx00, xx01 from ${args[0]} (simulated)` : 'csplit: missing operand',
            shred: (args) => { if (!args[0]) return 'shred: missing file'; const t = resolvePath(currentDir, args[0]); if (fileContents[t] !== undefined) { delete fileContents[t]; saveFs(); } return `shred: ${args[0]}: securely deleted`; },
            rev: (args) => { if (args[0]) { const t = resolvePath(currentDir, args[0]); if (fileContents[t] === undefined) return `rev: ${args[0]}: No such file`; return <div style={{ whiteSpace: 'pre' }}>{fileContents[t].split('\n').map((l: string) => l.split('').reverse().join('')).join('\n')}</div>; } return 'rev: use: echo hello | rev'; },
            rename: (args) => args.length >= 3 ? `rename: renamed ${args[2]} (${args[0]}→${args[1]}) (simulated)` : 'rename: usage: rename from to file',
            cksum: (args) => { if (!args[0]) return 'cksum: missing file'; const t = resolvePath(currentDir, args[0]); if (fileContents[t] === undefined) return `cksum: ${args[0]}: No such file`; let c = 0; for (const ch of fileContents[t]) c = (c * 31 + ch.charCodeAt(0)) >>> 0; return `${c} ${fileContents[t].length} ${args[0]}`; },
            md5sum: (args) => { if (!args[0]) return 'md5sum: missing file'; const t = resolvePath(currentDir, args[0]); if (fileContents[t] === undefined) return `md5sum: ${args[0]}: No such file`; let h = 0xdeadbeef; for (const c of fileContents[t]) h = ((h ^ c.charCodeAt(0)) * 0x5bd1e995) >>> 0; return `${h.toString(16).padStart(8, '0').repeat(4)}  ${args[0]}`; },
            sha1sum: (args) => { if (!args[0]) return 'sha1sum: missing file'; const t = resolvePath(currentDir, args[0]); if (fileContents[t] === undefined) return `sha1sum: ${args[0]}: No such file`; let h = 0x12345678; for (const c of fileContents[t]) h = (((h << 5) + h) + c.charCodeAt(0)) >>> 0; return `${h.toString(16).padStart(8, '0').repeat(5)}  ${args[0]}`; },
            sha256sum: (args) => { if (!args[0]) return 'sha256sum: missing file'; const t = resolvePath(currentDir, args[0]); if (fileContents[t] === undefined) return `sha256sum: ${args[0]}: No such file`; let h = 0x6a09e667; for (const c of fileContents[t]) h = (((h << 7) ^ c.charCodeAt(0)) ^ (h >>> 25)) >>> 0; return `${h.toString(16).padStart(8, '0').repeat(8)}  ${args[0]}`; },
            sum: (args) => { if (!args[0]) return 'sum: missing file'; const t = resolvePath(currentDir, args[0]); if (fileContents[t] === undefined) return `sum: ${args[0]}: No such file`; let s = 0; for (const c of fileContents[t]) s = (s + c.charCodeAt(0)) & 0xffff; return `${s}  1  ${args[0]}`; },
            access: (args) => { if (!args[0]) return 'access: missing file'; const t = resolvePath(currentDir, args[0]); return (fs[t] || fileContents[t] !== undefined) ? null : `access: ${args[0]}: No such file`; },
            look: (args) => { if (!args[0]) return 'look: missing string'; if (args[1]) { const t = resolvePath(currentDir, args[1]); if (fileContents[t] === undefined) return `look: ${args[1]}: No such file`; return fileContents[t].split('\n').filter((l: string) => l.startsWith(args[0])).join('\n') || '(no matches)'; } return `(no system dictionary in simulator for '${args[0]}')`; },
            // ══ Directory Ops ══
            dir: (args) => { const t = resolvePath(currentDir, args[0] ?? ''); return fs[t] ? fs[t].join('  ') : `dir: cannot access '${args[0] ?? t}': No such directory`; },
            dirs: () => currentDir,
            mount: (args) => args.length === 0 ? <div style={{ whiteSpace: 'pre' }}>{`/dev/sda1 on / type ext4 (rw,relatime)\ntmpfs on /tmp type tmpfs (rw)\nproc on /proc type proc (rw)`}</div> : `mount: ${args[0]}→${args[1] ?? '/mnt'} (simulated)`,
            umount: (args) => args[0] ? `umount: ${args[0]} unmounted (simulated)` : 'umount: missing operand',
            tree: (args) => { const base = args[0] ? resolvePath(currentDir, args[0]) : currentDir; const buildTree = (dir: string, ind: string): string => (fs[dir] || []).map((item: string, i: number, a: string[]) => { const p = `${dir}/${item}`; const last = i === a.length - 1; return (ind + (last ? '└── ' : '├── ')) + item + (fs[p] ? '\n' + buildTree(p, ind + (last ? '    ' : '│   ')) : ''); }).join('\n'); return <div style={{ whiteSpace: 'pre', color: '#7ec8e3' }}>{base + '\n' + buildTree(base, '')}</div>; },
            // ══ Permissions ══
            chattr: (args) => args.length >= 2 ? `chattr: attributes set on '${args[args.length - 1]}' (simulated)` : 'chattr: missing operand',
            // ══ User Mgmt ══
            chpasswd: (args) => `chpasswd: password updated for ${args[0]?.split(':')?.[0] ?? terminalUser} (simulated)`,
            finger: (args) => { const u = args[0] || terminalUser; return <div style={{ whiteSpace: 'pre' }}>{`Login: ${u}  Name: ${u}\nDirectory: /home/${u}  Shell: /bin/bash\nLast login: ${new Date().toDateString()} on pts/0`}</div>; },
            pinky: (args) => `${args[0] || terminalUser}   ${args[0] || terminalUser}   pts/0   ${new Date().toLocaleDateString()}`,
            users: () => terminalUser,
            groups: (args) => `${args[0] || terminalUser} : ${args[0] || terminalUser} adm sudo`,
            grpck: () => 'grpck: no errors found (simulated)',
            grpconv: () => 'grpconv: gshadow file updated (simulated)',
            // ══ Process ══
            pidof: (args) => { if (!args[0]) return 'pidof: missing argument'; const db: Record<string, string> = { bash: '1234', node: '567', sshd: '89', init: '1', cron: '812' }; return db[args[0]] || ''; },
            pmap: (args) => args[0] ? <div style={{ whiteSpace: 'pre' }}>{`${args[0]}:  bash\n00007f...  48K  r-x  /lib/x86_64-linux-gnu/libc.so\ntotal: 12.3M`}</div> : 'pmap: missing pid',
            mpstat: () => <div style={{ whiteSpace: 'pre' }}>{`Linux 5.15.0  ${new Date().toDateString()}\nCPU  %usr  %sys  %idle\nall   1.00  2.00  97.00`}</div>,
            chrt: (args) => args.length >= 2 ? `chrt: running '${args.slice(1).join(' ')}' at priority ${args[0]} (simulated)` : 'chrt: missing operand',
            accton: () => 'accton: accounting enabled (simulated)',
            // ══ Network extras ══
            hostid: () => '007f0101',
            hostnamectl: () => <div style={{ whiteSpace: 'pre' }}>{`Static hostname: ${terminalHost}\nOperating System: Ubuntu 22.04.3 LTS\nKernel: Linux 5.15.0\nArchitecture: x86-64`}</div>,
            iftop: () => <div style={{ whiteSpace: 'pre' }}>{`eth0: Listening\n192.168.1.104 <=> 8.8.8.8   1.5Kb  12.0Kb\nTX: 1.2Kb  RX: 12.4Kb  TOTAL: 13.6Kb`}</div>,
            ipcrm: (args) => args[0] ? `ipcrm: ${args.join(' ')} removed (simulated)` : 'ipcrm: missing argument',
            ipcs: () => <div style={{ whiteSpace: 'pre' }}>{`------ Message Queues --------\n(empty)\n------ Shared Memory --------\n(empty)\n------ Semaphore Arrays ------\n(empty)`}</div>,
            iptables: (args) => args.includes('-L') ? <div style={{ whiteSpace: 'pre' }}>{`Chain INPUT (policy ACCEPT)\nChain FORWARD (policy DROP)\nChain OUTPUT (policy ACCEPT)`}</div> : 'iptables: permission denied (simulate with sudo)',
            'iptables-save': () => `*filter\n:INPUT ACCEPT\n:OUTPUT ACCEPT\nCOMMIT`,
            nmcli: (args) => args[0] === 'dev' || args[0] === 'general' ? <div style={{ whiteSpace: 'pre' }}>{`DEVICE  TYPE      STATE\neth0    ethernet  connected\nlo      loopback  unmanaged`}</div> : 'Usage: nmcli [general|dev|con|radio]',
            nc: (args) => args[0] ? `nc: connect to ${args[0]} port ${args[1] || 80}: Connection refused (simulated)` : 'Usage: nc host port',
            netcat: (args) => args[0] ? `netcat: ${args[0]}: Connection refused (simulated)` : 'Usage: netcat host port',
            rcp: (args) => args.length >= 2 ? `rcp: deprecated — use scp. ${args[0]}→${args[1]} (simulated)` : 'rcp: missing operand',
            tracepath: (args) => { const h = args[0] || '8.8.8.8'; return <div style={{ whiteSpace: 'pre' }}>{` 1:  _gateway (192.168.1.1)   0.5ms\n 2:  10.0.0.1                 5.1ms\n 3:  no reply\n 4:  ${h}                   14.2ms reached`}</div>; },
            vnstat: () => <div style={{ whiteSpace: 'pre' }}>{`eth0 / daily\n${new Date().toLocaleDateString()}  rx: 5.12 MiB  tx: 1.24 MiB  total: 6.36 MiB`}</div>,
            // ══ Packages ══
            'apt-get': (args) => { if (args[0] === 'update') return 'Hit:1 http://archive.ubuntu.com focal InRelease\nReading package lists... Done'; if (args[0] === 'upgrade') return '0 upgraded, 0 newly installed.'; if (args[0] === 'install' && args[1]) return `E: Could not open lock file /var/lib/dpkg/lock`; return 'Usage: apt-get [update|upgrade|install|remove]'; },
            aptitude: (args) => args[0] ? `aptitude: ${args[0]} (simulated)` : 'aptitude: text UI not available in simulator',
            snap: (args) => args[0] === 'list' ? 'Name    Version  Rev\ncore20  20       1234\n' : args[0] ? `snap: ${args[0]} (simulated)` : 'Usage: snap [list|install|remove]',
            // ══ Scheduling ══
            atd: () => 'atd: running (simulated)',
            atrm: (args) => args[0] ? `atrm: job ${args[0]} removed` : 'atrm: missing job id',
            atq: () => '(no queued jobs)',
            batch: () => 'batch: job submitted (simulated)',
            cron: () => 'cron: crond running (PID 812)',
            // ══ Disk / FS ══
            cfdisk: () => 'cfdisk: requires root & block device (simulated)',
            dosfsck: (args) => args[0] ? `dosfsck: ${args[0]}: OK (simulated)` : 'dosfsck: missing device',
            dump: (args) => args[0] ? `DUMP: dumping to ${args[0]} (simulated)` : 'dump: missing destination',
            dumpe2fs: (args) => args[0] ? <div style={{ whiteSpace: 'pre' }}>{`Filesystem state: clean\nBlock count: 13107200\nFree blocks: 9000000`}</div> : 'dumpe2fs: missing device',
            fdisk: (args) => args.includes('-l') ? <div style={{ whiteSpace: 'pre' }}>{`Disk /dev/sda: 50 GiB\n/dev/sda1  *  2048  95422463  45.5G  Linux\n/dev/sda2     95422464  104857599  4.5G  Swap`}</div> : 'fdisk: use fdisk -l to list',
            sync: () => null,
            // ══ Hardware ══
            acpi: () => 'Battery 0: Discharging, 87%, 02:15:00 remaining',
            arch: () => 'x86_64',
            dstat: () => <div style={{ whiteSpace: 'pre' }}>{`----cpu---- -dsk- ---net--- ---paging--\nusr sys idl| rd  wr| recv send|  in   out\n  1   2  97|10k  5k|  8k  2k |   0    0`}</div>,
            hdparm: (args) => args.includes('-I') ? <div style={{ whiteSpace: 'pre' }}>{`Model: VBOX HARDDISK\nSize: 53.7 GB\nCapabilities: LBA DMA`}</div> : 'hdparm: use hdparm -I /dev/sda',
            hwclock: (args) => (args.includes('-r') || !args[0]) ? new Date().toString() : 'hwclock: (simulated)',
            iotop: () => <div style={{ whiteSpace: 'pre' }}>{`Total READ: 0.00 B/s | WRITE: 0.00 B/s\n  TID  USER     READ   WRITE  COMMAND\n 1234 ${terminalUser}   0.00   0.00  bash`}</div>,
            lsusb: () => <div style={{ whiteSpace: 'pre' }}>{`Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub\nBus 001 Device 002: ID 80ee:0021 VirtualBox USB Tablet`}</div>,
            lshw: (args) => args.includes('-short') ? <div style={{ whiteSpace: 'pre' }}>{`H/W Class    Description\nsystem       VirtualBox Machine\nprocessor    Intel Core i7\nmemory       7.6GiB RAM\nnetwork      Intel 82540EM Gigabit`}</div> : 'lshw: use lshw -short',
            // ══ Compression ══
            ar: (args) => args[0] ? `ar: ${args[0]} (static library op simulated)` : 'ar: usage: ar [rcs] lib.a files',
            bzcmp: (args) => args.length >= 2 ? `bzcmp: files are identical (simulated)` : 'bzcmp: missing operand',
            bzdiff: (args) => args.length >= 2 ? `bzdiff: no differences (simulated)` : 'bzdiff: missing operand',
            bzgrep: (args) => args.length >= 2 ? `bzgrep: searching '${args[1]}' for '${args[0]}' (simulated)` : 'bzgrep: missing operand',
            bzless: (args) => args[0] ? `bzless: ${args[0]} (END)` : 'bzless: missing file',
            bzmore: (args) => args[0] ? `bzmore: ${args[0]} (simulated)` : 'bzmore: missing file',
            zdiff: (args) => args.length >= 2 ? `zdiff: no differences (simulated)` : 'zdiff: missing operand',
            zgrep: (args) => args.length >= 2 ? `zgrep: no matches (simulated)` : 'zgrep: missing operand',
            gzexe: (args) => args[0] ? `gzexe: ${args[0]}.gz executable created (simulated)` : 'gzexe: missing file',
            // ══ Text Processing ══
            awk: (args) => { const prog = args[0]; const file = args.find((a: string, i: number) => i > 0 && !a.startsWith('-')); if (!prog) return "awk: usage: awk 'program' [file]"; if (!file) return "awk: use: cat file | awk 'print $1'"; const t = resolvePath(currentDir, file); if (fileContents[t] === undefined) return `awk: ${file}: No such file`; const lines = fileContents[t].split('\n'); if (prog.includes('$1')) return <div style={{ whiteSpace: 'pre' }}>{lines.map((l: string) => l.split(/\s+/)[0] || '').filter(Boolean).join('\n')}</div>; return <div style={{ whiteSpace: 'pre' }}>{lines.map((l: string, i: number) => `${i + 1} ${l}`).join('\n')}</div>; },
            sed: (args) => { const expr = args.find((a: string) => a.startsWith('s/')); const file = args.find((a: string, i: number) => i > 0 && !a.startsWith('-') && !a.startsWith('s/')); if (!expr || !file) return "sed: usage: sed 's/from/to/' file"; const t = resolvePath(currentDir, file); if (fileContents[t] === undefined) return `sed: ${file}: No such file`; const m = expr.match(/^s\/(.*?)\/(.*?)\//); if (m) return <div style={{ whiteSpace: 'pre-wrap' }}>{fileContents[t].split(m[1]).join(m[2])}</div>; return <div style={{ whiteSpace: 'pre-wrap' }}>{fileContents[t]}</div>; },
            egrep: (args) => { if (args.length < 2) return 'egrep: usage: egrep pattern file'; const [pat, file] = args; const t = resolvePath(currentDir, file); if (fileContents[t] === undefined) return `egrep: ${file}: No such file`; try { const re = new RegExp(pat); const m = fileContents[t].split('\n').filter((l: string) => re.test(l)); return m.length ? <div style={{ whiteSpace: 'pre', color: '#7ec8e3' }}>{m.join('\n')}</div> : ''; } catch { return `egrep: invalid regex '${pat}'`; } },
            fgrep: (args) => { if (args.length < 2) return 'fgrep: usage: fgrep string file'; const [pat, file] = args; const t = resolvePath(currentDir, file); if (fileContents[t] === undefined) return `fgrep: ${file}: No such file`; const m = fileContents[t].split('\n').filter((l: string) => l.includes(pat)); return m.length ? <div style={{ whiteSpace: 'pre', color: '#7ec8e3' }}>{m.join('\n')}</div> : ''; },
            aspell: (args) => args[0] === 'check' && args[1] ? `aspell: ${args[1]}: no errors found (simulated)` : 'aspell: usage: aspell check file',
            banner: (args) => { if (!args[0]) return 'banner: missing text'; return <div style={{ whiteSpace: 'pre', color: '#e95420', fontFamily: 'monospace' }}>{args.join(' ').toUpperCase().split('').map((c: string) => `██  ${c}  ██`).join('\n')}</div>; },
            col: () => 'col: use: cmd | col',
            colcrt: () => 'colcrt: use: cmd | colcrt',
            colrm: () => 'colrm: use: cmd | colrm <start> [end]',
            column: (args) => { const t = args[0] ? resolvePath(currentDir, args[0]) : null; if (!t) return 'column: use: cmd | column'; if (fileContents[t] === undefined) return `column: ${args[0]}: No such file`; return <div style={{ whiteSpace: 'pre' }}>{fileContents[t]}</div>; },
            dc: (args) => { if (!args[0]) return 'dc: interactive RPN (use bc for inline)'; try { return String(eval(args.join(' '))); } catch { return '(error)'; } },
            fmt: (args) => { if (!args[0]) return 'fmt: missing file'; const t = resolvePath(currentDir, args[0]); if (fileContents[t] === undefined) return `fmt: ${args[0]}: No such file`; const words = fileContents[t].split(/\s+/); const lines: string[] = []; let cur = ''; words.forEach((w: string) => { if ((cur + ' ' + w).length > 75) { lines.push(cur); cur = w; } else cur += (cur ? ' ' : '') + w; }); if (cur) lines.push(cur); return <div style={{ whiteSpace: 'pre-wrap' }}>{lines.join('\n')}</div>; },
            sdiff: (args) => { if (args.length < 2) return 'sdiff: missing operand'; const f1 = fileContents[resolvePath(currentDir, args[0])]; const f2 = fileContents[resolvePath(currentDir, args[1])]; if (!f1) return `sdiff: ${args[0]}: No such file`; if (!f2) return `sdiff: ${args[1]}: No such file`; return <div style={{ whiteSpace: 'pre' }}>{f1.split('\n').map((l: string, i: number) => l === f2.split('\n')[i] ? l.padEnd(40) + '  ' + l : l.padEnd(40) + ' | ' + (f2.split('\n')[i] || '')).join('\n')}</div>; },
            unix2dos: (args) => args[0] ? `unix2dos: ${args[0]}: LF→CRLF (simulated)` : 'unix2dos: missing file',
            dos2unix: (args) => args[0] ? `dos2unix: ${args[0]}: CRLF→LF (simulated)` : 'dos2unix: missing file',
            // ══ Kernel / Modules ══
            systemctl: (args) => { if (!args[0]) return 'Usage: systemctl [status|start|stop|enable|disable|list-units]'; if (args[0] === 'list-units' || args[0] === 'list') return <div style={{ whiteSpace: 'pre' }}>{`  UNIT                LOAD   ACTIVE  DESCRIPTION\n● ssh.service        loaded active  OpenSSH Server\n● cron.service       loaded active  Cron Scheduler\n● networking.service loaded active  Networking`}</div>; return `systemctl: ${args[0]} ${args[1] || ''} (simulated)`; },
            depmod: () => 'depmod: dependency map updated (simulated)',
            insmod: (args) => args[0] ? `insmod: ${args[0]} inserted (simulated)` : 'insmod: missing module',
            lsmod: () => <div style={{ whiteSpace: 'pre' }}>{`Module                  Size  Used by\nvirtualbox             380928  0\nibm_acpi                20480  0`}</div>,
            modinfo: (args) => args[0] ? <div style={{ whiteSpace: 'pre' }}>{`filename:    /lib/modules/5.15.0/${args[0]}.ko\nversion:     1.0\ndescription: ${args[0]} kernel module`}</div> : 'modinfo: missing module',
            rmmod: (args) => args[0] ? `rmmod: ${args[0]} removed (simulated)` : 'rmmod: missing module',
            // ══ System Power ══
            shutdown: (args) => (args.includes('-h') || args.includes('now') || args.includes('-r')) ? 'Broadcast: system going down NOW!' : 'shutdown: usage: shutdown [-h|-r] [now|+min]',
            reboot: () => 'Broadcast: system going down for reboot NOW! (simulated)',
            halt: () => 'System halted. (simulated)',
            poweroff: () => 'Power down. (simulated)',
            // ══ Logging ══
            journalctl: (args) => <div style={{ whiteSpace: 'pre', fontSize: '13px' }}>{`-- Logs begin at ${new Date().toDateString()} --\n${new Date().toISOString()} ${terminalHost} systemd[1]: Started system${args.includes('-f') ? ' (following mode — press Ctrl+C)' : ''}\n${new Date().toISOString()} ${terminalHost} sshd: Accepted login for ${terminalUser}`}</div>,
            last: () => <div style={{ whiteSpace: 'pre' }}>{`${terminalUser} pts/0 192.168.1.1 ${new Date().toDateString()} still logged in`}</div>,
            script: (args) => `Script started, log file: '${args[0] || 'typescript'}'. Type exit to stop.`,
            scriptreplay: (args) => args[0] ? `scriptreplay: replaying ${args[0]} (simulated)` : 'scriptreplay: missing timing file',
            ac: () => 'total 1.23',
            // ══ Mail ══
            biff: () => 'biff: is y',
            mailq: () => 'Mail queue is empty',
            write: (args) => args[0] ? `write: message sent to ${args[0]} (simulated)` : 'write: usage: write user',
            wall: (args) => <div style={{ whiteSpace: 'pre' }}>{`\nBroadcast from ${terminalUser}@${terminalHost}:\n${args.join(' ') || '(empty)'}`}</div>,
            // ══ Audio / Printing ══
            amixer: (args) => (!args[0] || args[0] === 'get') ? `Simple mixer 'Master': Playback 80 [80%] [on]` : `amixer: ${args[0]} (simulated)`,
            aplay: (args) => args[0] ? `Playing WAVE '${args[0]}' (simulated audio)` : 'aplay: missing soundfile',
            aplaymidi: (args) => args[0] ? `aplaymidi: playing '${args[0]}' (simulated)` : 'aplaymidi: missing file',
            cupsd: () => 'cupsd: CUPS daemon started (simulated)',
            eject: (args) => args[0] ? `eject: ${args[0]} ejected (simulated)` : 'eject /dev/sr0 (simulated)',
            // ══ Scripting / Builtins ══
            printf: (args) => { if (!args[0]) return 'printf: missing format'; return args[0].replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/%s/g, args[1] || '').replace(/%d/g, String(parseInt(args[1]) || 0)); },
            read: (args) => args[0] ? `read: ${args[0]}=(reading stdin — use in scripts)` : 'read: reading from stdin',
            seq: (args) => { if (!args[0]) return 'seq: missing operand'; const start = args[1] ? parseInt(args[0]) : 1; const end = args[1] ? parseInt(args[1]) : parseInt(args[0]); if (isNaN(end)) return `seq: invalid argument '${args[0]}'`; return <div style={{ whiteSpace: 'pre' }}>{Array.from({ length: Math.min(end - start + 1, 200) }, (_, i) => start + i).join('\n')}</div>; },
            factor: (args) => { if (!args[0]) return 'factor: missing argument'; const n = parseInt(args[0]); if (isNaN(n) || n < 1) return `factor: invalid '${args[0]}'`; const f: number[] = []; let x = n, d = 2; while (d * d <= x) { while (x % d === 0) { f.push(d); x = Math.floor(x / d); } d++; } if (x > 1) f.push(x); return `${n}: ${f.join(' ')}`; },
            expr: (args) => { if (!args[0]) return 'expr: missing expression'; try { return String(eval(args.join(' '))); } catch { return 'expr: syntax error'; } },
            let: (args) => { if (!args[0]) return 'let: missing expression'; try { return String(eval(args.join(' '))); } catch { return ''; } },
            set: () => <div style={{ whiteSpace: 'pre' }}>{`HOME=/root\nUSER=${terminalUser}\nSHELL=/bin/bash\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`}</div>,
            unset: (args) => args[0] ? null : 'unset: missing variable name',
            source: (args) => args[0] ? `source: ${args[0]}: sourced (simulated)` : 'source: missing file',
            declare: (args) => args[0] ? null : <div style={{ whiteSpace: 'pre' }}>{`declare -- HOME="/root"\ndeclare -- USER="${terminalUser}"\ndeclare -- SHELL="/bin/bash"`}</div>,
            eval: (args) => { try { return String(eval(args.join(' '))); } catch { return 'eval: syntax error'; } },
            exec: (args) => args[0] ? `exec: replacing shell with '${args[0]}' (simulated)` : 'exec: missing command',
            enable: (args) => args[0] ? `enable: '${args[0]}' enabled` : 'enable: missing builtin',
            builtin: (args) => args[0] ? `executing builtin '${args[0]}'` : 'builtin: missing command',
            bind: (args) => args[0] ? `bind: '${args[0]}' bound (simulated)` : 'bind -l (lists readline bindings)',
            fc: () => commandHistory.length ? commandHistory[commandHistory.length - 1] : 'fc: no previous commands',
            yes: (args) => <div style={{ whiteSpace: 'pre' }}>{Array(20).fill(args[0] || 'y').join('\n') + '\n(Ctrl+C to stop — 20 lines shown)'}</div>,
            'export -p': () => <div style={{ whiteSpace: 'pre' }}>{`declare -x HOME="/root"\ndeclare -x PATH="/usr/bin:/bin"\ndeclare -x USER="${terminalUser}"\ndeclare -x SHELL="/bin/bash"`}</div>,
            // ══ Development ══
            gcc: (args) => args[0] ? `gcc: ${args[args.length - 1]}: no compiler in simulator` : 'gcc: missing input file',
            'g++': (args) => args[0] ? `g++: ${args[args.length - 1]}: no compiler in simulator` : 'g++: missing input file',
            cc: (args) => args[0] ? `cc: no compiler in simulator` : 'cc: missing input file',
            gdb: (args) => args[0] ? `GNU gdb 12.1\n(gdb) — interactive debugger not supported in simulator\nType quit to exit.` : 'gdb: no executable specified',
            make: (args) => args[0] === 'clean' ? 'rm -f *.o\nmake: cleaned' : 'Makefile: No such file\nmake: *** No targets. Stop.',
            // ══ Help / Docs ══
            apropos: (args) => { if (!args[0]) return 'apropos: missing keyword'; const db: Record<string, string> = { ls: 'ls (1) - list directory contents', grep: 'grep (1) - search files', find: 'find (1) - search for files', cat: 'cat (1) - concatenate files', cp: 'cp (1) - copy files', mv: 'mv (1) - move files', rm: 'rm (1) - remove files' }; const found = Object.entries(db).filter(([k]) => k.includes(args[0]) || db[k].includes(args[0])); return found.length ? found.map(([, v]) => v).join('\n') : `apropos: nothing appropriate for '${args[0]}'`; },
            info: (args) => args[0] ? `info: documentation for '${args[0]}' — try 'man ${args[0]}'` : 'Top-level menu:\n* GNU Core Utilities\n* bash\n',
            whatis: (args) => { if (!args[0]) return 'whatis: missing command'; const db: Record<string, string> = { ls: 'ls (1) - list directory contents', grep: 'grep (1) - lines matching pattern', cp: 'cp (1) - copy files', mv: 'mv (1) - move files', rm: 'rm (1) - remove files', cat: 'cat (1) - concatenate files', find: 'find (1) - search for files' }; return db[args[0]] ?? `${args[0]}: nothing appropriate.`; },
            // ══ Terminal / Session ══
            reset: () => { setHistory([]); return 'Terminal reset.'; },
            screen: (args) => args[0] ? `screen: session '${args[0]}' (simulated — multiplexer unavailable in browser)` : 'screen: multiplexer not available in browser (simulated)',
            stty: (args) => args.includes('-a') ? <div style={{ whiteSpace: 'pre' }}>{`speed 38400 baud; rows 24; columns 80\nline = 0; intr = ^C; erase = ^?; kill = ^U`}</div> : 'stty: speed 38400 baud; rows 24; cols 80',
            showkey: () => 'showkey: not applicable in browser (use DevTools)',
            agetty: () => 'agetty: login terminal manager (simulated)',
            chvt: (args) => args[0] ? `chvt: switched to virtual terminal ${args[0]} (simulated)` : 'chvt: missing argument',
            'xdg-open': (args) => args[0] ? `xdg-open: opening '${args[0]}' (simulated)` : 'xdg-open: missing argument',
        };

        if (cmds[cmd]) {
            const out = cmds[cmd](args);
            if (out !== null) print(out);
        } else {
            print(`${cmd}: command not found`);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const trimmed = inputStr.trim();
            setInputStr("");
            if (trimmed) {
                const newHistory = [...commandHistory, trimmed];
                setCommandHistory(newHistory);
                setHistoryIndex(newHistory.length);
                handleCommand(trimmed);
            } else {
                print(
                    <div>
                        <span className="prompt"><span className="user">{terminalUser}@{terminalHost}</span>:<span className="path">{displayPath}</span>#</span>
                    </div>
                );
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (historyIndex > 0) {
                setInputStr(commandHistory[historyIndex - 1]);
                setHistoryIndex(historyIndex - 1);
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                setInputStr(commandHistory[historyIndex + 1]);
                setHistoryIndex(historyIndex + 1);
            } else {
                setInputStr("");
                setHistoryIndex(commandHistory.length);
            }
        }
    };

    // Sidebar command definitions
    const commandDocs = [
        // General
        { name: "help", desc: "Show help message" },
        { name: "clear", desc: "Clear the terminal" },
        { name: "pwd", desc: "Print working directory" },
        { name: "whoami", desc: "Print current user" },
        { name: "hostname", desc: "Show system hostname" },
        { name: "date", desc: "Print date and time" },
        { name: "cal", desc: "Show calendar" },
        { name: "uptime", desc: "System uptime" },
        { name: "uname -a", desc: "Print system info" },
        { name: "id", desc: "Print user/group IDs" },
        { name: "who", desc: "Who is logged in" },
        { name: "w", desc: "Who is logged in (extended)" },
        { name: "tty", desc: "Print terminal name" },
        { name: "history", desc: "Command history" },
        { name: "which [cmd]", desc: "Locate a command" },
        { name: "alias [name=val]", desc: "Create an alias" },
        { name: "echo [text]", desc: "Print text" },
        { name: "bc [expr]", desc: "Calculator (basic)" },
        { name: "sleep [n]", desc: "Wait N seconds" },
        { name: "neofetch", desc: "System info + ASCII art" },
        // File System
        { name: "ls [dir]", desc: "List directory" },
        { name: "ls -l [dir]", desc: "Long listing" },
        { name: "cd [dir]", desc: "Change directory" },
        { name: "mkdir [dir]", desc: "Create directory" },
        { name: "rmdir [dir]", desc: "Remove empty dir" },
        { name: "touch [file]", desc: "Create empty file" },
        { name: "rm [file]", desc: "Remove file" },
        { name: "rm -r [dir]", desc: "Remove dir recursively" },
        { name: "cp [src] [dst]", desc: "Copy file" },
        { name: "mv [src] [dst]", desc: "Move/rename file" },
        { name: "cat [file]", desc: "Display file" },
        { name: "less [file]", desc: "Page through file" },
        { name: "more [file]", desc: "Page through file" },
        { name: "head [file]", desc: "First 10 lines" },
        { name: "head -n [n] [file]", desc: "First N lines" },
        { name: "tail [file]", desc: "Last 10 lines" },
        { name: "grep [pat] [file]", desc: "Search pattern in file" },
        { name: "find [dir] -name [f]", desc: "Find files" },
        { name: "locate [name]", desc: "Locate files" },
        { name: "wc [file]", desc: "Word/line/byte count" },
        { name: "sort [file]", desc: "Sort lines" },
        { name: "diff [f1] [f2]", desc: "Compare two files" },
        { name: "comm [f1] [f2]", desc: "Compare sorted files" },
        { name: "cmp [f1] [f2]", desc: "Compare bytes" },
        { name: "split [file]", desc: "Split file into parts" },
        { name: "file [name]", desc: "Determine file type" },
        { name: "type [cmd]", desc: "Describe command type" },
        { name: "chmod [mode] [file]", desc: "Change permissions" },
        { name: "chown [user] [file]", desc: "Change owner" },
        { name: "chgrp [grp] [file]", desc: "Change group" },
        // Piping & Redirection
        { name: "cmd | cmd2", desc: "Pipe output to next cmd" },
        { name: "cmd > file", desc: "Redirect output to file" },
        { name: "cmd >> file", desc: "Append output to file" },
        { name: "tr [from] [to]", desc: "Translate chars (pipe)" },
        { name: "uniq", desc: "Remove duplicate lines (pipe)" },
        { name: "cut -d: -f1", desc: "Cut fields (pipe)" },
        { name: "tee [file]", desc: "Pipe output + write to file" },
        // Archive / Compress
        { name: "tar -cvf [arc] [dir]", desc: "Create tar archive" },
        { name: "tar -xvf [arc]", desc: "Extract tar archive" },
        { name: "gzip [file]", desc: "Compress with gzip" },
        { name: "gunzip [file]", desc: "Decompress gzip" },
        { name: "bzip2 [file]", desc: "Compress with bzip2" },
        { name: "zip [arc] [files]", desc: "Zip files" },
        { name: "unzip [file]", desc: "Unzip archive" },
        // User Management
        { name: "su [user]", desc: "Switch user" },
        { name: "passwd [user]", desc: "Change password" },
        { name: "useradd [user]", desc: "Add user" },
        { name: "userdel [user]", desc: "Delete user" },
        { name: "usermod [opts] [user]", desc: "Modify user" },
        { name: "adduser [user]", desc: "Interactive add user" },
        { name: "groupadd [grp]", desc: "Add group" },
        { name: "groupdel [grp]", desc: "Delete group" },
        { name: "chage [user]", desc: "Password expiry info" },
        { name: "chfn [user]", desc: "Change user info" },
        { name: "chsh", desc: "Change login shell" },
        // Process
        { name: "top", desc: "Monitor processes" },
        { name: "htop", desc: "Interactive process viewer" },
        { name: "ps", desc: "List processes" },
        { name: "ps aux", desc: "Full process list" },
        { name: "pstree", desc: "Process tree" },
        { name: "kill [pid]", desc: "Kill process by PID" },
        { name: "pkill [name]", desc: "Kill by name" },
        { name: "killall [name]", desc: "Kill all by name" },
        { name: "pgrep [name]", desc: "Find PID by name" },
        { name: "nice [cmd]", desc: "Run with priority" },
        { name: "renice [n] [pid]", desc: "Change process priority" },
        { name: "fg", desc: "Bring job to foreground" },
        { name: "bg", desc: "Send job to background" },
        { name: "jobs", desc: "List active jobs" },
        // Memory / Disk
        { name: "free", desc: "Memory usage" },
        { name: "vmstat", desc: "Virtual memory stats" },
        { name: "df", desc: "Disk filesystem usage" },
        { name: "du [path]", desc: "Directory disk usage" },
        { name: "pagesize", desc: "Memory page size" },
        { name: "sar", desc: "System activity report" },
        { name: "dmidecode -t bios", desc: "Hardware info" },
        // Network
        { name: "ifconfig", desc: "Network interfaces" },
        { name: "iwconfig", desc: "Wireless interfaces" },
        { name: "ping [host]", desc: "Ping a host" },
        { name: "traceroute [host]", desc: "Trace route" },
        { name: "netstat", desc: "Network connections" },
        { name: "nslookup [host]", desc: "DNS lookup" },
        { name: "dig [host]", desc: "DNS lookup (detailed)" },
        { name: "host [name]", desc: "DNS lookup (simple)" },
        { name: "whois [domain]", desc: "Domain registrar info" },
        { name: "arp", desc: "ARP table" },
        { name: "route", desc: "Routing table" },
        { name: "nmap [host]", desc: "Port scan" },
        { name: "tcpdump", desc: "Capture packets" },
        { name: "curl [url]", desc: "HTTP request" },
        { name: "wget [url]", desc: "Download file" },
        { name: "nload", desc: "Network bandwidth monitor" },
        { name: "ifplugstatus", desc: "Cable plug status" },
        { name: "telnet [host]", desc: "Telnet to host" },
        { name: "mail [to]", desc: "Send mail (simulated)" },
        // System Info & Env
        { name: "env", desc: "Environment variables" },
        { name: "printenv [var]", desc: "Print env variable" },
        { name: "export [var=val]", desc: "Set env variable" },
        { name: "man [cmd]", desc: "Manual page" },
        // Package & Privilege
        { name: "sudo [cmd]", desc: "Run as superuser" },
        { name: "apt update", desc: "Update package list" },
        { name: "apt install [pkg]", desc: "Install package" },
        { name: "lp [file]", desc: "Print file" },
        { name: "lpstat", desc: "Printer status" },
        { name: "lprm [id]", desc: "Cancel print job" },
        // ── Runtimes & Editors ──
        { name: "python3 [file]", desc: "Run Python 3 script" },
        { name: "node [file]", desc: "Run Node.js script" },
        { name: "vim [file]", desc: "Open file in vim (hint)" },
        { name: "nano [file]", desc: "Open file in nano (hint)" },
        { name: "vi [file]", desc: "Open file in vi (hint)" },
        { name: "bash", desc: "Bash shell info" },
        // ── File Operations (extended) ──
        { name: "tac [file]", desc: "Reverse lines of file" },
        { name: "od [file]", desc: "Octal dump of file" },
        { name: "paste [f1] [f2]", desc: "Merge lines of files side by side" },
        { name: "join [f1] [f2]", desc: "Join lines of two sorted files" },
        { name: "fold -w 80 [file]", desc: "Wrap long lines" },
        { name: "csplit [file] [pat]", desc: "Split file by context" },
        { name: "shred [file]", desc: "Securely delete a file" },
        { name: "rev [file]", desc: "Reverse each line" },
        { name: "rename [from] [to] [file]", desc: "Rename files using pattern" },
        { name: "cksum [file]", desc: "Checksum and byte count" },
        { name: "md5sum [file]", desc: "MD5 checksum" },
        { name: "sha1sum [file]", desc: "SHA1 checksum" },
        { name: "sha256sum [file]", desc: "SHA256 checksum" },
        { name: "sum [file]", desc: "File checksum (BSD style)" },
        { name: "access [file]", desc: "Check file accessibility" },
        { name: "look [str] [file]", desc: "Search file for prefix" },
        // ── Directory Operations ──
        { name: "dir [path]", desc: "List directory (like ls)" },
        { name: "dirs", desc: "Show directory stack" },
        { name: "mount", desc: "Show mounted filesystems" },
        { name: "mount [dev] [dir]", desc: "Mount a device" },
        { name: "umount [dir]", desc: "Unmount a device" },
        { name: "tree [dir]", desc: "Show directory tree" },
        // ── Permissions & Ownership ──
        { name: "chattr [opts] [file]", desc: "Change file attributes" },
        // ── User Management (extended) ──
        { name: "chpasswd", desc: "Update passwords in batch" },
        { name: "finger [user]", desc: "User info (login, shell)" },
        { name: "pinky [user]", desc: "Light finger output" },
        { name: "users", desc: "List logged-in users" },
        { name: "groups [user]", desc: "Show user groups" },
        { name: "grpck", desc: "Check group file integrity" },
        { name: "grpconv", desc: "Convert group to gshadow" },
        // ── Process Management (extended) ──
        { name: "pidof [name]", desc: "Get PID of a program" },
        { name: "pmap [pid]", desc: "Memory map of a process" },
        { name: "mpstat", desc: "Per-CPU usage stats" },
        { name: "chrt [prio] [cmd]", desc: "Set real-time scheduling" },
        { name: "accton", desc: "Enable process accounting" },
        { name: "time [cmd]", desc: "Measure command execution time" },
        { name: "watch [cmd]", desc: "Repeat command every 2s" },
        { name: "strace [cmd]", desc: "Trace syscalls (simulated)" },
        { name: "crontab -l", desc: "List scheduled cron jobs" },
        { name: "at", desc: "Schedule one-time job" },
        { name: "atq", desc: "List queued at jobs" },
        { name: "atrm [id]", desc: "Remove at job" },
        { name: "batch", desc: "Queue job for low-load time" },
        { name: "cron", desc: "Cron daemon status" },
        // ── Networking (extended) ──
        { name: "ip addr", desc: "Show IP addresses" },
        { name: "ip route", desc: "Show routing table" },
        { name: "ss", desc: "Socket statistics" },
        { name: "hostid", desc: "Print numeric host ID" },
        { name: "hostnamectl", desc: "System host info" },
        { name: "iftop", desc: "Real-time bandwidth by conn" },
        { name: "ipcrm [opts]", desc: "Remove IPC resource" },
        { name: "ipcs", desc: "Show IPC resources" },
        { name: "iptables -L", desc: "List firewall rules" },
        { name: "iptables-save", desc: "Save firewall rules" },
        { name: "nmcli dev", desc: "Network manager CLI" },
        { name: "nc [host] [port]", desc: "Netcat connection" },
        { name: "rcp [src] [dst]", desc: "Remote copy (deprecated)" },
        { name: "tracepath [host]", desc: "Trace path to host" },
        { name: "vnstat", desc: "Network traffic stats" },
        { name: "ssh [host]", desc: "SSH to remote host" },
        { name: "scp [src] [dst]", desc: "Secure remote copy" },
        { name: "rsync [src] [dst]", desc: "Remote sync files" },
        // ── Packages ──
        { name: "apt-get update", desc: "Update package database" },
        { name: "apt-get install [pkg]", desc: "Install package" },
        { name: "apt-get upgrade", desc: "Upgrade packages" },
        { name: "aptitude [cmd]", desc: "High-level package manager" },
        { name: "snap list", desc: "List snap packages" },
        // ── Disk / FS ──
        { name: "lsblk", desc: "List block devices" },
        { name: "blkid", desc: "Show block device UUIDs" },
        { name: "fdisk -l", desc: "List disk partitions" },
        { name: "cfdisk", desc: "Partition editor (simulated)" },
        { name: "dosfsck [dev]", desc: "Check FAT filesystem" },
        { name: "dump [dst]", desc: "Filesystem backup (sim)" },
        { name: "dumpe2fs [dev]", desc: "Show ext2/3/4 info" },
        { name: "sync", desc: "Flush filesystem buffers" },
        // ── Hardware / System Info ──
        { name: "dmesg", desc: "Kernel ring buffer messages" },
        { name: "dstat", desc: "System resource stats" },
        { name: "hdparm -I [dev]", desc: "Hard disk parameters" },
        { name: "hwclock", desc: "Read hardware clock" },
        { name: "iotop", desc: "I/O usage by process" },
        { name: "lsusb", desc: "List USB devices" },
        { name: "lshw -short", desc: "Hardware list (summary)" },
        { name: "iostat", desc: "CPU & I/O stats" },
        { name: "acpi", desc: "Battery / power info" },
        { name: "arch", desc: "Machine architecture" },
        // ── Compression (extended) ──
        { name: "ar [opts] [lib] [files]", desc: "Create static library" },
        { name: "bzcmp [f1] [f2]", desc: "Compare bzip2 files" },
        { name: "bzdiff [f1] [f2]", desc: "Diff bzip2 files" },
        { name: "bzgrep [pat] [file]", desc: "Grep in bzip2 file" },
        { name: "bzless [file]", desc: "Less viewer for bzip2" },
        { name: "bzmore [file]", desc: "More viewer for bzip2" },
        { name: "zdiff [f1] [f2]", desc: "Diff gzip files" },
        { name: "zgrep [pat] [file]", desc: "Grep in gzip file" },
        { name: "gzexe [file]", desc: "Create self-extracting gzip" },
        // ── Text Processing ──
        { name: "awk '[prog]' [file]", desc: "Pattern scanning tool" },
        { name: "sed 's/a/b/' [file]", desc: "Stream editor, substitute" },
        { name: "egrep [pat] [file]", desc: "Grep with extended regex" },
        { name: "fgrep [str] [file]", desc: "Grep literal string" },
        { name: "aspell check [file]", desc: "Spell check file" },
        { name: "banner [text]", desc: "Print banner text" },
        { name: "col", desc: "Filter reverse line feeds (pipe)" },
        { name: "column [file]", desc: "Columnate output" },
        { name: "dc [expr]", desc: "RPN calculator" },
        { name: "fmt [file]", desc: "Format text to 75 chars/line" },
        { name: "sdiff [f1] [f2]", desc: "Side-by-side file diff" },
        { name: "unix2dos [file]", desc: "Convert LF to CRLF" },
        { name: "dos2unix [file]", desc: "Convert CRLF to LF" },
        // ── Kernel Modules ──
        { name: "systemctl [cmd]", desc: "Manage services" },
        { name: "systemctl list-units", desc: "List all systemd units" },
        { name: "depmod", desc: "Generate module dependencies" },
        { name: "insmod [mod]", desc: "Insert kernel module" },
        { name: "lsmod", desc: "List loaded kernel modules" },
        { name: "modinfo [mod]", desc: "Module info" },
        { name: "rmmod [mod]", desc: "Remove kernel module" },
        // ── System Power ──
        { name: "shutdown -h now", desc: "Shutdown immediately" },
        { name: "shutdown -r now", desc: "Reboot immediately" },
        { name: "reboot", desc: "Reboot system" },
        { name: "halt", desc: "Halt the system" },
        { name: "poweroff", desc: "Power off the system" },
        // ── Logging ──
        { name: "journalctl", desc: "Systemd journal logs" },
        { name: "journalctl -f", desc: "Follow journal logs live" },
        { name: "last", desc: "Last logged-in users" },
        { name: "script [file]", desc: "Record terminal session" },
        { name: "scriptreplay [file]", desc: "Replay recorded session" },
        { name: "ac", desc: "Total connect time" },
        // ── Checksum / Integrity ──
        { name: "stat [file]", desc: "File status details" },
        // ── Date & Time ──
        { name: "datetime", desc: "Show full date and time" },
        { name: "cal", desc: "Calendar month view" },
        { name: "date", desc: "System date and time" },
        { name: "uptime", desc: "System uptime and load" },
        // ── Mail / Communication ──
        { name: "biff", desc: "Notify on new mail" },
        { name: "mailq", desc: "Show mail queue" },
        { name: "write [user]", desc: "Send message to user" },
        { name: "wall [msg]", desc: "Broadcast to all users" },
        { name: "mail [addr]", desc: "Send mail" },
        // ── Audio / Printing ──
        { name: "amixer", desc: "Sound mixer (ALSA)" },
        { name: "aplay [file]", desc: "Play audio file" },
        { name: "eject [dev]", desc: "Eject media device" },
        { name: "cupsd", desc: "CUPS print daemon" },
        // ── Scripting / Builtins ──
        { name: "printf [fmt]", desc: "Formatted print" },
        { name: "read [var]", desc: "Read from stdin" },
        { name: "seq [n]", desc: "Print number sequence" },
        { name: "seq [start] [end]", desc: "Print number range" },
        { name: "factor [n]", desc: "Prime factorize a number" },
        { name: "expr [a] + [b]", desc: "Evaluate expression" },
        { name: "let [expr]", desc: "Evaluate arithmetic" },
        { name: "set", desc: "Show shell variables" },
        { name: "unset [var]", desc: "Unset variable" },
        { name: "source [file]", desc: "Source a shell script" },
        { name: "declare", desc: "Show declared variables" },
        { name: "eval [expr]", desc: "Evaluate string as command" },
        { name: "exec [cmd]", desc: "Replace shell with command" },
        { name: "enable [builtin]", desc: "Enable shell builtin" },
        { name: "builtin [cmd]", desc: "Run shell builtin" },
        { name: "bind [key=cmd]", desc: "Bind readline key" },
        { name: "fc", desc: "Fix last command" },
        { name: "yes [str]", desc: "Repeatedly output string" },
        { name: "export -p", desc: "List all exported variables" },
        // ── Development ──
        { name: "gcc [file]", desc: "Compile C (simulated)" },
        { name: "g++ [file]", desc: "Compile C++ (simulated)" },
        { name: "gdb [bin]", desc: "GNU debugger (simulated)" },
        { name: "make", desc: "Build from Makefile" },
        { name: "make clean", desc: "Clean build files" },
        // ── Help & Docs ──
        { name: "apropos [kw]", desc: "Search man page descriptions" },
        { name: "info [cmd]", desc: "Info page for command" },
        { name: "whatis [cmd]", desc: "One-line man page summary" },
        // ── Terminal / Session ──
        { name: "reset", desc: "Reset terminal output" },
        { name: "screen [name]", desc: "Terminal multiplexer" },
        { name: "stty", desc: "Terminal line settings" },
        { name: "stty -a", desc: "All terminal line settings" },
        { name: "chvt [n]", desc: "Switch virtual terminal" },
        { name: "xdg-open [file]", desc: "Open file with default app" },
        // ── File Info ──
        { name: "basename [path]", desc: "Strip directory from path" },
        { name: "dirname [path]", desc: "Strip filename from path" },
        { name: "mktemp", desc: "Create temp file/dir" },
        { name: "fuser [file]", desc: "Which process uses file" },
        { name: "readlink [file]", desc: "Show symlink target" },
        { name: "ldd [bin]", desc: "Show shared lib deps" },
    ];

    const filteredCommands = commandDocs.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );


    const handleCommandClick = (cmdItem: any) => {
        const baseCmd = cmdItem.name.split(" ")[0];
        if (cmdItem.name.includes("[")) {
            setInputStr(baseCmd + " ");
        } else {
            setInputStr(baseCmd);
        }
        inputRef.current?.focus();
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
    };

    const windowStyle: React.CSSProperties = (isMaximized || isSnapped !== "none")
        ? { position: "absolute", top: 0, left: "var(--window-offset-left)", width: "calc(100% - var(--window-offset-left))", height: "calc(100% - var(--dock-bottom, 0px))", zIndex: zIndex || 10, transform: "none", transition: isDragging ? "none" : "transform 0.1s" }
        : {
            opacity: isMinimized ? 0 : 1,
            pointerEvents: isMinimized ? "none" : "auto",
            zIndex: zIndex || 10,
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? "none" : "transform 0.1s",
            width: "min(680px, 90%)",
            height: "min(480px, 80%)"
        };

    return (
        <div
            className={`terminal-window ${isDarkMode ? "dark-mode" : "light-mode"} ${isMaximized ? "maximized" : ""} ${isSnapped === 'left' ? 'snapped-left' : isSnapped === 'right' ? 'snapped-right' : ''}`}
            id="terminal-window"
            style={windowStyle}
            onClick={() => {
                inputRef.current?.focus();
                if (onFocus) onFocus();
            }}
        >
            <div
                className="terminal-header"
                onMouseDown={handleMouseDown}
                style={{ cursor: isMaximized ? "default" : "grab" }}
            >
                <div className="terminal-buttons">
                    <span className="close" onClick={onClose}></span>
                    <span className="minimize" onClick={onMinimize}></span>
                    <span className="maximize" onClick={onMaximize}></span>
                </div>
                <div className="terminal-title">{terminalUser}@{terminalHost}: {displayPath}</div>
                <div className="terminal-actions">
                    <button className="action-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
                        {isDarkMode ? (
                            <svg className="icon theme-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                        ) : (
                            <svg className="icon theme-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                        )}
                    </button>
                    <button className="action-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <svg className="icon help-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    </button>
                </div>
            </div>
            <div className="terminal-content">
                <div className="terminal-body" ref={bodyRef} onClick={() => inputRef.current?.focus()} style={{ color: isDarkMode ? terminalTextColor : "#000000" }}>
                    <div id="output">
                        {history.map(item => (
                            <div key={item.id} className="output-row">
                                {item.content}
                            </div>
                        ))}
                    </div>
                    <div className="input-line">
                        <span className="prompt"><span className="user">{terminalUser}@{terminalHost}</span>:<span className="path">{displayPath}</span>#</span>
                        <input
                            type="text"
                            id="command-input"
                            autoComplete="off"
                            spellCheck="false"
                            autoFocus
                            ref={inputRef}
                            value={inputStr}
                            onChange={(e) => setInputStr(e.target.value)}
                            onKeyDown={onKeyDown}
                            style={{ color: isDarkMode ? terminalTextColor : "#000000" }}
                        />
                    </div>
                </div>

                {/* Sidebar for commands */}
                <div className={`terminal-sidebar ${isSidebarOpen ? 'open' : ''}`} id="terminal-sidebar" onClick={(e) => e.stopPropagation()}
                    style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderLeft: '1px solid rgba(233,84,32,0.2)' }}>

                    {/* Sidebar header with search */}
                    <div style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: isDarkMode ? '#e95420' : '#c73a00', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" }}>📚 Commands</span>
                            <span style={{ color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)', fontSize: '10px', fontFamily: "'Inter',sans-serif" }}>{filteredCommands.length} cmds</span>
                        </div>
                        {/* Search box */}
                        <div style={{ position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, opacity: 0.4 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input
                                type="text"
                                id="command-search"
                                placeholder="Search 200+ commands..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory('All'); }}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                style={{ width: '100%', paddingLeft: 26, boxSizing: 'border-box', borderRadius: 8 }}
                            />
                        </div>
                    </div>

                    {/* Category filter chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 8px 4px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                        {['All', 'File', 'Dir', 'Text', 'Net', 'Process', 'User', 'Kernel', 'System', 'Script', 'Dev'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
                                style={{
                                    padding: '2px 8px', fontSize: '10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                                    fontFamily: "'Inter',sans-serif", fontWeight: 600, letterSpacing: '0.04em',
                                    background: activeCategory === cat ? (isDarkMode ? '#e95420' : '#c73a00') : (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                                    color: activeCategory === cat ? '#fff' : (isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)'),
                                    transition: 'all 0.15s',
                                }}
                            >{cat}</button>
                        ))}
                    </div>

                    {/* Command list */}
                    <ul id="command-list" className="command-list" style={{ flex: 1, overflowY: 'auto', margin: 0, padding: 0 }}>
                        {filteredCommands
                            .filter(c => {
                                if (activeCategory === 'All') return true;
                                const catKeywords: Record<string, string[]> = {
                                    'File': ['file', 'cat', 'cp', 'mv', 'rm', 'touch', 'ln', 'wc', 'diff', 'sort', 'head', 'tail', 'tac', 'od', 'paste', 'join', 'fold', 'shred', 'rev', 'cksum', 'md5', 'sha', 'sum', 'look', 'split', 'tar', 'gzip', 'bzip', 'zip', 'unzip', 'ar', 'compress'],
                                    'Dir': ['dir', 'cd', 'ls', 'mkdir', 'rmdir', 'pwd', 'tree', 'mount', 'du', 'find', 'locate', 'df'],
                                    'Text': ['grep', 'awk', 'sed', 'egrep', 'fgrep', 'cut', 'tr', 'sort', 'uniq', 'wc', 'echo', 'printf', 'fmt', 'col', 'banner', 'rev', 'tee', 'diff', 'sdiff', 'comm'],
                                    'Net': ['ping', 'curl', 'wget', 'ssh', 'scp', 'rsync', 'ifconfig', 'netstat', 'ip ', 'ss', 'traceroute', 'tracepath', 'nslookup', 'dig', 'host', 'whois', 'arp', 'route', 'nc ', 'netcat', 'telnet', 'iwconfig', 'vnstat', 'iftop', 'nmcli', 'iptables'],
                                    'Process': ['ps', 'top', 'htop', 'kill', 'pkill', 'killall', 'pgrep', 'pstree', 'nice', 'renice', 'fg', 'bg', 'jobs', 'pidof', 'pmap', 'mpstat', 'chrt', 'time', 'watch', 'uptime', 'at ', 'atq', 'atrm', 'batch', 'cron'],
                                    'User': ['who', 'whoami', 'su ', 'passwd', 'useradd', 'userdel', 'usermod', 'adduser', 'groupadd', 'groupdel', 'chown', 'chgrp', 'chmod', 'chage', 'chfn', 'chsh', 'finger', 'pinky', 'users', 'groups', 'id '],
                                    'Kernel': ['systemctl', 'lsmod', 'insmod', 'rmmod', 'modinfo', 'depmod', 'dmesg', 'uname', 'journalctl'],
                                    'System': ['shutdown', 'reboot', 'halt', 'poweroff', 'free', 'vmstat', 'sar', 'arch', 'acpi', 'lsblk', 'blkid', 'fdisk', 'df ', 'du ', 'iostat', 'iotop', 'lsusb', 'lshw', 'hdparm', 'hwclock', 'dstat'],
                                    'Script': ['echo', 'printf', 'read', 'seq', 'factor', 'expr', 'let', 'set', 'unset', 'export', 'source', 'declare', 'eval', 'exec', 'enable', 'builtin', 'bind', 'fc', 'yes', 'alias', 'env', 'printenv'],
                                    'Dev': ['gcc', 'g++', 'gdb', 'make', 'python3', 'node', 'vim', 'nano', 'bash', 'git'],
                                };
                                const kws = catKeywords[activeCategory] || [];
                                return kws.some(kw => c.name.toLowerCase().includes(kw));
                            })
                            .map((c, i) => (
                                <li key={i} onClick={() => handleCommandClick(c)}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '9px 12px', cursor: 'pointer' }}>
                                    <span className="cmd-name" style={{ color: isDarkMode ? '#e95420' : '#c73a00', fontWeight: 700, fontFamily: "'Ubuntu Mono',monospace", fontSize: '12px', display: 'block', marginBottom: 2 }}>{c.name}</span>
                                    <span className="cmd-desc" style={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.7)', fontSize: '11px', fontFamily: "'Inter',sans-serif", lineHeight: 1.3 }}>{c.desc}</span>
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
