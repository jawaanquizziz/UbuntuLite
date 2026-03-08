"use client";

import React, { useState, useRef, useEffect } from "react";
import { resolvePath, fs, fileContents, saveFs } from "@/lib/MockFs";
import { useDraggable } from "@/hooks/useDraggable";

export default function TerminalApp({ onClose, onMinimize, onMaximize, isMaximized, isMinimized, zIndex, onFocus, terminalUser = "root", terminalHost = "ubuntu" }: any) {
    const [currentDir, setCurrentDir] = useState("/root");
    const [history, setHistory] = useState<{ id: number, content: React.ReactNode }[]>([]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [inputStr, setInputStr] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { position, handleMouseDown, isDragging } = useDraggable(isMaximized);

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
                <div style={{ display: "flex", gap: "20px", color: "inherit", whiteSpace: "pre" }}>
                    <div style={{ color: "#e95420", fontWeight: "bold" }}>
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
                    <div>
                        <span style={{ color: "#e95420", fontWeight: "bold" }}>{terminalUser}@{terminalHost}</span><br />
                        -----------------<br />
                        <span style={{ color: "#e95420", fontWeight: "bold" }}>OS</span>: Ubuntu 22.04.3 LTS (Web Sim)<br />
                        <span style={{ color: "#e95420", fontWeight: "bold" }}>Host</span>: Web Terminal Virtual Machine<br />
                        <span style={{ color: "#e95420", fontWeight: "bold" }}>Kernel</span>: 5.15.0-generic-js<br />
                        <span style={{ color: "#e94520", fontWeight: "bold" }}>Uptime</span>: 1 min<br />
                        <span style={{ color: "#e95420", fontWeight: "bold" }}>Packages</span>: 1842 (dpkg)<br />
                        <span style={{ color: "#e95420", fontWeight: "bold" }}>Shell</span>: bash (simulated)<br />
                        <span style={{ color: "#e95420", fontWeight: "bold" }}>Terminal</span>: React Next.js Simulator<br />
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
            uptime: () => 'up 1 day, 2:30,  1 user,  load average: 0.00, 0.01, 0.05',
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
            useradd: (args) => { const u = args.find((a: string) => !a.startsWith('-')) || ''; return u ? `useradd: user '${u}' added (simulated)` : 'useradd: missing username'; },
            adduser: (args) => args[0] ? `Adding user '${args[0]}' ...\nCreating home '/home/${args[0]}' ...\npassword set (simulated)` : 'adduser: missing username',
            usermod: (args) => args.length >= 2 ? `usermod: user modified (simulated)` : 'usermod: missing operand',
            userdel: (args) => args[0] ? `userdel: user '${args[0]}' removed (simulated)` : 'userdel: missing operand',
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
        // Runtimes & Editors
        { name: "python3 [file]", desc: "Run Python 3 script" },
        { name: "node [file]", desc: "Run Node.js script" },
        { name: "vim [file]", desc: "Open file in editor" },
        { name: "nano [file]", desc: "Open file in editor" },
        { name: "bash", desc: "Bash shell" },
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

    const windowStyle: React.CSSProperties = isMaximized
        ? { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 0, border: "none", zIndex: zIndex || 10 }
        : {
            opacity: isMinimized ? 0 : 1,
            pointerEvents: isMinimized ? "none" : "auto",
            zIndex: zIndex || 10,
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? "none" : "transform 0.1s"
        };

    return (
        <div
            className={`terminal-window ${isDarkMode ? "dark-mode" : "light-mode"} ${isMaximized ? "maximized" : ""}`}
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
                <div className="terminal-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
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
                        />
                    </div>
                </div>

                {/* Sidebar for commands */}
                <div className={`terminal-sidebar ${isSidebarOpen ? 'open' : ''}`} id="terminal-sidebar" onClick={(e) => e.stopPropagation()}>
                    <div className="sidebar-header">
                        <h3>Commands Reference</h3>
                        <input
                            type="text"
                            id="command-search"
                            placeholder="Search commands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        />
                    </div>
                    <ul id="command-list" className="command-list">
                        {filteredCommands.map((c, i) => (
                            <li key={i} onClick={() => handleCommandClick(c)}>
                                <span className="cmd-name">{c.name}</span>
                                <span className="cmd-desc">{c.desc}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
