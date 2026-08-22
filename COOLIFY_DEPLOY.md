# Coolify Deployment Guide (MLM Demo)

Ye project ab **apne server ke Coolify** pe deploy karne ke liye ready hai. Railway wali files
(`railway.json`, `nixpacks.toml`, `start.sh`) code me touch nahi kiye — sirf ye 4 nayi files add
hui hain:

| File | Kaam |
|---|---|
| `Dockerfile` | Multi-stage build: Angular frontend + .NET 8 backend ek image me |
| `docker-compose.yml` | App + MySQL 8 dono services, Coolify direct detect karega |
| `.dockerignore` | Fast/clean Docker build |
| `COOLIFY_DEPLOY.md` | Ye guide |

App ka flow same rehta hai jaise Railway pe tha: Angular build -> `wwwroot` me copy -> .NET API
usko serve karta hai. Database **migrations + seed data app start hote waqt automatically chal
jaate hain** (`Program.cs`), koi manual step nahi.

---

## Step 1: Files ko GitHub pe push karo

```bash
git add Dockerfile docker-compose.yml .dockerignore COOLIFY_DEPLOY.md
git commit -m "Add Coolify deployment setup"
git push origin master
```

## Step 2: Coolify me project banao

1. Coolify dashboard -> **+ New Resource**
2. **Git Repository** choose karo
3. Repo select karo: `swamiparneet-design/mlm-demo`, branch `master`
4. **Build Pack = "Docker Compose"** select karo (auto-detect ho sakta hai kyunki repo root me
   `docker-compose.yml` hai)

## Step 3: Environment Variables set karo

Coolify ke is resource ke **Environment Variables** section me ye daalo (defaults already
compose me lage hue hain, lekin production me change karna zaroori hai):

| Variable | Example / Note |
|---|---|
| `MYSQL_PASSWORD` | Apna strong password (default `ChangeMe123`) |
| `MYSQL_ROOT_PASSWORD` | MySQL root password (default `RootChangeMe123`) |
| `MYSQL_DATABASE` | `mlmdb` (ya jo chaho) |
| `MYSQL_USER` | `mlmuser` |
| `JWT_SECRET` | Lamba random string (64+ chars). Default fallback hai but override karo |

> Agar koi variable set nahi bhi kiya to defaults se stack chalega — bas passwords production me
> badal do.

## Step 4: Domain assign karo

- Deploy hone ke baad (ya pehle bhi) resource ke **Domains** setting me jao
- Domain daalo: e.g. `https://mlm.yourdomain.com` aur port **8080** choose karo
- SSL/TLS automatic aayega (Coolify proxy Let's Encrypt handle karta hai)

## Step 5: Deploy & Verify

- **Deploy** button dabao. Pehli build me ~5-10 min lag sakte hain.
- Logs me ye confirm karo:
  - Angular build complete
  - EF migrations applied (`Applying migration ...`)
  - Seed done, phir `Now listening on: http://[::]:8080`

## Step 6: Login

Seed data se super admin ban jaata hai:

- URL: `https://your-domain.com`
- Email: `superadmin@mlm.com`
- Password: `Admin@12345`

*(Pehle login ke baad password change kar lena.)*

---

## External MySQL use karni ho to

Agar apni alag MySQL server use karni ho (Coolify ke bundled MySQL ki jagah):

1. `docker-compose.yml` me `mysql:` service aur top-level `volumes:` block comment out karo
2. Environment variables me set karo:
   - `MYSQL_HOST=your-mysql-server-ip-or-host`
   - `MYSQL_PORT=3306`
   - `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
3. Redeploy

## Troubleshooting

| Problem | Fix |
|---|---|
| App bar bar restart ho raha | Logs dekho — usually DB connect nahi hui. Check `MYSQL_HOST`, passwords |
| `Access denied for user` | `MYSQL_PASSWORD` env app aur mysql dono services me same honi chahiye |
| 502 Bad Gateway | App abhi start ho rahi hoga (migrations chal rahi), 30-60 sec wait karke reload |
| Build fail | Coolify build logs me exact error dekho; `frontend/package-lock.json` repo me committed honi chahiye |

## Ports note

Container internally port **8080** pe chalta hai. Direct access ke liye `docker-compose.yml` me
`ports:` line uncomment karo, warna domain assign karna best practice hai (Coolify reverse proxy
handle karta hai).
