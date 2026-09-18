from pathlib import Path
p = Path('/home/ubuntu/sistema-ahorro-cooperativo/client/src/pages/Home.tsx')
s = p.read_text()
old = '''  const dashboard = trpc.cooperative.dashboard.useQuery(undefined, { enabled: Boolean(user) });
  const adminPayments = trpc.cooperative.adminPayments.useQuery(undefined, { enabled: user?.role === "admin" && activeView === "admin" });
  const reviewPayment = trpc.cooperative.reviewPayment.useMutation();
  const profileMutation = trpc.cooperative.updateProfile.useMutation();
  const activateMutation = trpc.cooperative.activateLevel.useMutation();
  const utils = trpc.useUtils();
  const [activeView, setActiveView] = useState<"overview" | "account" | "history" | "admin">("overview");'''
new = '''  const dashboard = trpc.cooperative.dashboard.useQuery(undefined, { enabled: Boolean(user) });
  const profileMutation = trpc.cooperative.updateProfile.useMutation();
  const activateMutation = trpc.cooperative.activateLevel.useMutation();
  const utils = trpc.useUtils();
  const [activeView, setActiveView] = useState<"overview" | "account" | "history" | "admin">("overview");
  const adminPayments = trpc.cooperative.adminPayments.useQuery(undefined, { enabled: user?.role === "admin" && activeView === "admin" });
  const reviewPayment = trpc.cooperative.reviewPayment.useMutation();'''
if old not in s:
    raise SystemExit('state block not found')
p.write_text(s.replace(old, new))
