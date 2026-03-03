const fs = require('fs');

const targetFile = 'c:\\Users\\jawaa_p0aeelf\\OneDrive\\Desktop\\college_offline_test\\ubuntu_terminal.js';
let content = fs.readFileSync(targetFile, 'utf8');

const newCommands = `
// ==========================================
// FILE & DIRECTORY MOCKS
// ==========================================
commands.rmdir = () => "rmdir: missing operand";
commands.rm = () => "rm: missing operand";
commands.cp = () => "cp: missing file operand";
commands.mv = () => "mv: missing file operand";
commands.chmod = () => "chmod: missing operand";
commands.wc = () => "0 0 0";
commands.grep = () => "Usage: grep [OPTION]... PATTERNS [FILE]...";
commands.tr = () => "tr: missing operand";
commands.sort = () => "sort: missing operand";
commands.head = () => "head: missing operand";
commands.tail = () => "tail: missing operand";
commands.diff = () => "diff: missing operand";
commands.comm = () => "comm: missing operand";
commands.less = () => "Opening mock pager... (Press 'q' to quit)";
commands.more = () => "Opening mock pager... (Press 'q' to quit)";
commands.file = () => "file: missing operand";
commands.type = (args) => args[0] ? \`\${args[0]} is a tracked mock command\` : "type: missing operand";
commands.split = () => "split: missing operand";
commands.cmp = () => "cmp: missing operand";
commands.tar = () => "tar: option requires an argument -- 'f'";
commands.find = () => ".";
commands.vim = () => "Opening mock Vim editor... (Press :wq to exit)";
commands.gzip = () => "gzip: compressed data not written to a terminal.";
commands.bzip2 = () => "bzip2: I won't write compressed data to a terminal.";
commands.unzip = () => "UnZip 6.00 of 20 April 2009, by Debian. Original by Info-ZIP.";
commands.locate = () => "locate: no pattern to search for specified";
commands.cal = () => "      March 2026\\nSu Mo Tu We Th Fr Sa\\n 1  2  3  4  5  6  7\\n 8  9 10 11 12 13 14\\n15 16 17 18 19 20 21\\n22 23 24 25 26 27 28\\n29 30 31";
commands.tty = () => "/dev/pts/0";
commands.bc = () => "bc 1.07.1\\nCopyright 1991-1994, 1997, 1998, 2000, 2004, 2006, 2008, 2012-2017 Free Software Foundation, Inc.";
commands.exit = () => "logout";
commands.man = (args) => args[0] ? \`No manual entry for \${args[0]}\` : "What manual page do you want?";
commands.which = (args) => args[0] ? \`/usr/bin/\${args[0]}\` : "";
commands.lp = () => "lp: Error - no default destination available.";
commands.lpr = () => "lpr: Error - no default destination available.";
commands.lpstat = () => "no system default destination";
commands.lpq = () => "lpq: Error - no default destination available.";
commands.lprm = () => "lprm: Error - no default destination available.";
commands.cancel = () => "cancel: missing operand";
commands.who = () => "root     pts/0        2026-03-03 10:00";

// ==========================================
// USER & SYSTEM MANAGEMENT MOCKS
// ==========================================
commands.su = () => "su: Authentication failure";
commands.login = () => "login: cannot run from a terminal";
commands.logout = () => "Not login shell: use \`exit'";
commands.passwd = () => "Changing password for root.\\nNew password:";
commands.useradd = () => "useradd: Permission denied. (Mock)";
commands.adduser = () => "adduser: Only root may add a user or group to the system.";
commands.usermod = () => "usermod: no flags given";
commands.userdel = () => "userdel: no flags given";
commands.groupadd = () => "groupadd: no flags given";
commands.groupmod = () => "groupmod: no flags given";
commands.groupdel = () => "groupdel: no flags given";
commands.gpasswd = () => "gpasswd: no flags given";
commands.chown = () => "chown: missing operand";
commands.chage = () => "Usage: chage [options] LOGIN";
commands.chgrp = () => "chgrp: missing operand";
commands.chfn = () => "chfn: Permission denied.";

// ==========================================
// PROCESS & PERFORMANCE MANAGEMENT MOCKS
// ==========================================
commands.ps = () => "  PID TTY          TIME CMD\\n    1 pts/0    00:00:00 bash\\n   10 pts/0    00:00:00 ps";
commands.pstree = () => "systemd─┬─NetworkManager─┬─2*[dhclient]\\n        │                └─2*[resolvconf]\\n        ├─bash───pstree";
commands.nice = () => "0";
commands.kill = () => "kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]";
commands.pkill = () => "pkill: missing operand";
commands.killall = () => "killall: missing operand";
commands.xkill = () => "Select the window whose client you wish to kill with button 1....";
commands.fg = () => "bash: fg: current: no such job";
commands.bg = () => "bash: bg: current: no such job";
commands.pgrep = () => "pgrep: missing operand";
commands.renice = () => "renice: missing operand";
commands.free = () => "               total        used        free      shared  buff/cache   available\\nMem:         8141208     1215284     5441632       12344     1484292     6628676\\nSwap:        2097148           0     2097148";
commands["/proc/meminfo"] = () => "bash: /proc/meminfo: Permission denied (Try 'cat /proc/meminfo')";
commands.htop = () => "Opening mock htop view...";
commands.df = () => "Filesystem     1K-blocks    Used Available Use% Mounted on\\n/dev/sda1       50000000 15000000  35000000  30% /\\ntmpfs            4070604       0   4070604   0% /dev/shm";
commands.du = () => "4       ./Documents\\n4       ./Downloads\\n8       .";
commands.vmstat = () => "procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----\\n r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st\\n 1  0      0 5441632  48240 1436052    0    0    12     5   45   60  1  0 99  0  0";
commands.demidecode = () => "dmidecode: command not found (Try 'sudo dmidecode')";
commands.sar = () => "Linux 5.15.0-generic (ubuntu)   03/03/2026      _x86_64_        (4 CPU)\\n\\n10:00:01 AM       LINUX RESTART";
commands.pagesize = () => "4096";

// ==========================================
// NETWORKING MOCKS
// ==========================================
commands.traceroute = (args) => args[0] ? \`traceroute to \${args[0]} (93.184.216.34), 30 hops max, 60 byte packets\\n 1  router.local (192.168.1.1)  1.234 ms\\n 2  isp.gateway (10.0.0.1)  10.456 ms\\n 3  * * *\` : "Usage: traceroute host";
commands.netstat = () => "Active Internet connections (w/o servers)\\nProto Recv-Q Send-Q Local Address           Foreign Address         State\\ntcp        0      0 ubuntu:53422            ec2-54-204-12-3:https ESTABLISHED";
commands.nslookup = (args) => args[0] ? \`Server:         127.0.0.53\\nAddress:        127.0.0.53#53\\n\\nNon-authoritative answer:\\nName:   \${args[0]}\\nAddress: 93.184.216.34\` : "Usage: nslookup host";
commands.whois = () => "whois: missing operand";
commands.hostname = () => "ubuntu";
commands.tcpdump = () => "tcpdump: verbose output suppressed, use -v or -vv for full protocol decode\\nlistening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes";
commands.dig = (args) => args[0] ? \`; <<>> DiG 9.18.1-1ubuntu1.2-Ubuntu <<>> \${args[0]}\\n;; global options: +cmd\\n;; Got answer:\\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 4567\\n;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1\\n\\n;; ANSWER SECTION:\\n\${args[0]}.           300     IN      A       93.184.216.34\` : "Usage: dig host";
commands.route = () => "Kernel IP routing table\\nDestination     Gateway         Genmask         Flags Metric Ref    Use Iface\\ndefault         router.local    0.0.0.0         UG    100    0        0 eth0\\n192.168.1.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0";
commands.host = (args) => args[0] ? \`\${args[0]} has address 93.184.216.34\` : "Usage: host [name]";
commands.arp = () => "Address                  HWtype  HWaddress           Flags Mask            Iface\\nrouter.local             ether   00:11:22:33:44:55   C                     eth0";
commands.iwconfig = () => "lo        no wireless extensions.\\n\\neth0      no wireless extensions.";
commands.curl = (args) => args[0] ? \`<html>\\n<head><title>Mock Response for \${args[0]}</title></head>\\n<body><h1>Success!</h1></body>\\n</html>\` : "curl: try 'curl --help' or 'curl --manual' for more information";
commands.wget = (args) => args[0] ? \`--2026-03-03 10:00:00--  \${args[0]}\\nResolving \${args[0]} (\${args[0]})... 93.184.216.34\\nConnecting to \${args[0]}... connected.\\nHTTP request sent, awaiting response... 200 OK\\nLength: 1256 (1.2K) [text/html]\\nSaving to: 'index.html'\\n\\n     0K .                                                     100% 12.3M=0s\` : "wget: missing URL";
commands.telnet = () => "telnet: missing host";
commands.ifplugstatus = () => "eth0: link beat detected";
commands.nload = () => "nload: mock visualizer (press ctrl+c to exit)";
commands.w = () => " 10:00:01 up 1 min,  1 user,  load average: 0.00, 0.00, 0.00\\nUSER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\\nroot     pts/0    192.168.1.100    09:59    1.00s  0.02s  0.00s bash";
commands.mail = () => "No mail for root";
`;

content = content.replace('commands["apt-get"] = commands.apt;', 'commands["apt-get"] = commands.apt;\n' + newCommands);

// Update help string
const oldHelpStart = "Click the book icon in the top right to open the command reference sidebar!\\nAvailable commands:\\n";
const newHelpBlock = `Click the book icon in the top right to open the command reference sidebar!
Also supporting all simulated General Utility, File/Directory, System/User, Process, and Networking commands requested:
General: pwd, cd, mkdir, touch, cat, date, time, cal, tty, bc, echo, clear, exit, man, which, history, lp, lpr, lpstat, lpq, lprm, cancel, who, whoami, mv, cp, rm
File: ls, rmdir, chmod, wc, grep, tr, sort, head, tail, diff, comm, less, more, file, type, split, cmp, tar, find, vim, gzip, bzip2, unzip, locate
User: su, sudo, login, logout, passwd, useradd/adduser, usermod, userdel, groupadd, groupmod, groupdel, gpasswd, chown, chage, chgrp, chfn
Process: ps, pstree, nice, kill, pkill, killall, xkill, fg, bg, pgrep, renice, free, /proc/meminfo, top, htop, df, du, vmstat, demidecode, sar, pagesize
Networking: ifconfig, ping, traceroute, netstat, nslookup, whois, hostname, tcpdump, dig, route, host, arp, iwconfig, curl, wget, telnet, ifplugstatus, nload, w, mail, apt

Try any of them! Note: Interactive apps like vim, less, top are mocked.
`;

let helpRegex = /Click the book icon in the top right to open the command reference sidebar![\s\S]*?nmap \[host\]/m;
content = content.replace(helpRegex, newHelpBlock);

// Update sidebar commandDocs
const newSidebarDocs = `
    { name: "ping [host]", desc: "Send ICMP ECHO_REQUEST" },
    { name: "nmap [host]", desc: "Network exploration tool" },
    { name: "rmdir [dir]", desc: "Remove directory" },
    { name: "rm [file]", desc: "Remove files" },
    { name: "cp [src] [dest]", desc: "Copy files" },
    { name: "mv [src] [dest]", desc: "Move files" },
    { name: "chmod [mode] [file]", desc: "Change permissions" },
    { name: "wc [file]", desc: "Word count" },
    { name: "grep [pattern]", desc: "Search text" },
    { name: "find [path]", desc: "Find files" },
    { name: "vim [file]", desc: "Text editor" },
    { name: "tar [flags]", desc: "Archive utility" },
    { name: "passwd", desc: "Change password" },
    { name: "ps", desc: "Process status" },
    { name: "kill [pid]", desc: "Terminate process" },
    { name: "free", desc: "Memory usage" },
    { name: "df", desc: "Disk free" },
    { name: "du", desc: "Disk usage" },
    { name: "traceroute [host]", desc: "Trace path to host" },
    { name: "netstat", desc: "Network statistics" },
    { name: "curl [url]", desc: "Transfer data from URL" },
    { name: "wget [url]", desc: "Download from URL" }
`;

content = content.replace('{ name: "ping [host]", desc: "Send ICMP ECHO_REQUEST" },\n    { name: "nmap [host]", desc: "Network exploration tool" }', newSidebarDocs);

fs.writeFileSync(targetFile, content);
console.log("Updated ubuntu_terminal.js successfully");
