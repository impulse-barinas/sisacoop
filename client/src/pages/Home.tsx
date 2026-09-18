import { useMemo, useState } from "react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toCsv } from "../../../shared/csv";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Copy,
  FileCheck2,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

const SPIRAL_POSITIONS = [1, 8, 9, 2, 7, 10, 3, 6, 11, 4, 5, 12];
const LEVEL_COLORS = ["#f97316", "#eab308", "#14b8a6", "#8b5cf6"];
const formatMoney = (amount = 0) => `$${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
const formatDate = (date: Date | string | null | undefined) => date ? new Date(date).toLocaleString("es-VE", { dateStyle: "medium", timeStyle: "short" }) : "—";
function downloadCsv(filename: string, headers: string[], rows: unknown[][]) {
  const csv = toCsv(headers, rows);
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function LogoMark() {
  return <div className="logo-mark"><span /><span /><span /></div>;
}

function LoginScreen() {
  return (
    <main className="login-shell">
      <div className="login-orbit orbit-one" />
      <div className="login-orbit orbit-two" />
      <section className="login-card">
        <div className="brand-lockup"><LogoMark /><div><p className="eyebrow">SISTEMA COOPERATIVO</p><h1>Ahorra en comunidad.</h1></div></div>
        <div className="login-art"><div className="art-glow" /><div className="coin-stack"><span>$</span><span>$</span><span>$</span></div><p>4 niveles · 12 participantes</p></div>
        <p className="login-copy">Organiza tu cultivo digital, registra tus aportes y sigue cada cosecha desde un mismo lugar.</p>
        <div className="login-actions"><Button className="primary-btn w-full" onClick={() => startLogin()}><ShieldCheck className="mr-2 h-4 w-4" /> Iniciar sesión</Button><Button variant="outline" className="secondary-btn w-full" onClick={() => startLogin()}>Crear nueva cuenta <ChevronRight className="ml-2 h-4 w-4" /></Button></div>
        <p className="security-note"><ShieldCheck className="h-3.5 w-3.5" /> Acceso gestionado de forma segura. No guardamos contraseñas en la aplicación.</p>
      </section>
      <footer className="login-footer"><span>AHORRO · CONFIANZA · CRECIMIENTO</span><span>v0.1 MVP</span></footer>
    </main>
  );
}

function StatCard({ icon: Icon, label, value, detail, tone }: { icon: typeof BadgeDollarSign; label: string; value: string; detail: string; tone: string }) {
  return <div className={`stat-card ${tone}`}><div className="stat-icon"><Icon className="h-4 w-4" /></div><div><p>{label}</p><strong>{value}</strong><span>{detail}</span></div></div>;
}

function ParticipantOrb({ position, active, accountNumber, amount, registeredAt, onClick }: { position: number; active: boolean; accountNumber?: string | null; amount?: number; registeredAt?: Date | string | null; onClick?: () => void }) {
  const gridIndex = SPIRAL_POSITIONS.indexOf(position);
  const gridColumn = gridIndex % 3;
  const gridRow = Math.floor(gridIndex / 3);
  const entryX = gridColumn === 0 ? "-72px" : gridColumn === 2 ? "72px" : "0px";
  const entryY = gridRow < 2 ? "42px" : gridRow > 2 ? "-42px" : "0px";
  const entryDelay = `${Math.max(0, gridIndex) * 55}ms`;
  return <button onClick={onClick} className={`participant-orb ${active ? "is-active" : "is-inactive"}`} style={{ "--entry-x": entryX, "--entry-y": entryY, "--entry-delay": entryDelay } as React.CSSProperties} aria-label={`Participante número ${position}`}>
    <span className="orb-top"><span className="orb-amount">{active ? formatMoney(amount) : "—"}</span></span>
    <span className="orb-center"><span className="orb-position">N°{String(position).padStart(2, "0")}</span></span>
    <span className="orb-orange"><span className="orb-account">{active ? `Cnta: ${accountNumber || "0001"}` : "Disponible"}</span></span>
    <span className="orb-info"><span>{active && registeredAt ? formatDate(registeredAt) : "Sin registro"}</span><span>{active ? "Activo ahora" : "Esperando"}</span></span>
  </button>;
}

function LevelFlow({ level, participants, selected, onSelect, onActivate }: { level: any; participants: any[]; selected: boolean; onSelect: () => void; onActivate: () => void }) {
  const own = participants.find((participant) => participant.levelId === level.id && participant.userId);
  const occupied = participants.filter((participant) => participant.levelId === level.id).length;
  const isLocked = level.status === "locked";
  const isActive = level.status === "active";
  return <section className={`level-panel ${selected ? "selected" : ""} ${isLocked ? "locked" : ""}`}>
    <div className="level-heading"><div><div className="flex items-center gap-2"><span className="level-dot" style={{ background: LEVEL_COLORS[level.levelNumber - 1] }} /><h3>Nivel {level.levelNumber}</h3><Badge className={isActive ? "status-active" : isLocked ? "status-locked" : "status-available"}>{isActive ? "Activo" : isLocked ? "Bloqueado" : "Disponible"}</Badge></div><p>{occupied} de {level.participantCount} participantes · cultivo {formatMoney(level.cultivationAmount)}</p></div><div className="level-heading-actions">{!isLocked && !isActive && <Button size="sm" className="primary-btn" onClick={onActivate}>Activar nivel</Button>}{isActive && <Button size="sm" variant="outline" className="flow-btn" onClick={onSelect}>Ver flujo real <ChevronRight className="ml-1 h-4 w-4" /></Button>}</div></div>
    <div className="flow-board"><div className="flow-line" />{SPIRAL_POSITIONS.map(position => <ParticipantOrb key={position} position={position} active={own?.position === position} accountNumber={own?.accountNumber} amount={level.cultivationAmount} registeredAt={own?.registeredAt} onClick={onSelect} />)}</div>
    <div className="level-footer"><span><Sparkles className="h-3.5 w-3.5" /> Semilla {formatMoney(level.seedAmount)}</span><span><BadgeDollarSign className="h-3.5 w-3.5" /> Cosecha {formatMoney(level.harvestAmount)}</span><span className="ml-auto"><Clock3 className="h-3.5 w-3.5" /> {level.startedAt ? `Inicio ${formatDate(level.startedAt)}` : "Aún no iniciado"}</span></div>
  </section>;
}

function PaymentModal({ levelId, onClose, onSuccess }: { levelId: number; onClose: () => void; onSuccess: () => void }) {
  const [direction, setDirection] = useState<"sent" | "received">("sent");
  const [amount, setAmount] = useState("10");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const mutation = trpc.cooperative.addPayment.useMutation();

  const onFileChange = (selected: File | undefined) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/") || selected.size > 5 * 1024 * 1024) {
      toast.error("Selecciona una imagen de máximo 5 MB.");
      return;
    }
    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(selected);
  };

  const submit = async () => {
    const numericAmount = Math.round(Number(amount) * 100);
    if (!numericAmount) return toast.error("Indica un monto válido.");
    setIsSaving(true);
    try {
      await mutation.mutateAsync({ levelId, direction, amount: numericAmount, note: note || undefined, proofData: preview || undefined, fileName: file?.name, mimeType: file?.type });
      toast.success("Pago registrado y enviado a revisión.");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "No fue posible registrar el pago.");
    } finally { setIsSaving(false); }
  };

  return <div className="modal-backdrop"><section className="payment-modal" role="dialog" aria-modal="true"><button className="modal-close" onClick={onClose} aria-label="Cerrar"><X className="h-4 w-4" /></button><div className="modal-kicker"><ReceiptText className="h-4 w-4" /> Registro de movimiento</div><h2>{direction === "sent" ? "Registrar pago realizado" : "Registrar pago recibido"}</h2><p className="modal-subtitle">Adjunta la captura de tu operación para conservar un historial verificable.</p><div className="direction-tabs"><button className={direction === "sent" ? "active" : ""} onClick={() => setDirection("sent")}><ArrowUpRight className="h-4 w-4" /> Pago realizado</button><button className={direction === "received" ? "active" : ""} onClick={() => setDirection("received")}><ArrowDownLeft className="h-4 w-4" /> Pago recibido</button></div><div className="form-grid"><div><Label htmlFor="amount">Monto ($)</Label><div className="amount-input"><span>$</span><Input id="amount" type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} /></div></div><div><Label htmlFor="note">Referencia / nota</Label><Input id="note" placeholder="Ej. Pago móvil 0012" value={note} onChange={e => setNote(e.target.value)} /></div></div><Label>Captura de comprobante</Label><label className={`upload-zone ${preview ? "has-preview" : ""}`}>{preview ? <><img src={preview} alt="Vista previa del comprobante" /><span><Check className="h-4 w-4" /> {file?.name}</span></> : <><ImagePlus className="h-6 w-6" /><strong>Cargar imagen de captura</strong><small>PNG, JPG o WEBP · máximo 5 MB</small></>}<input type="file" accept="image/*" className="sr-only" onChange={e => onFileChange(e.target.files?.[0])} /></label><div className="modal-actions"><Button variant="outline" className="secondary-btn" onClick={onClose}>Cancelar</Button><Button className="primary-btn" onClick={submit} disabled={isSaving}>{isSaving ? "Guardando…" : "Registrar movimiento"}</Button></div></section></div>;
}

function AppShell() {
  const { user, loading, logout } = useAuth();
  const dashboard = trpc.cooperative.dashboard.useQuery(undefined, { enabled: Boolean(user) });
  const profileMutation = trpc.cooperative.updateProfile.useMutation();
  const activateMutation = trpc.cooperative.activateLevel.useMutation();
  const utils = trpc.useUtils();
  const [activeView, setActiveView] = useState<"overview" | "account" | "history" | "admin">("overview");
  const adminPayments = trpc.cooperative.adminPayments.useQuery(undefined, { enabled: user?.role === "admin" && activeView === "admin" });
  const reviewPayment = trpc.cooperative.reviewPayment.useMutation();
  const [mobileNav, setMobileNav] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [paymentLevelId, setPaymentLevelId] = useState<number | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "", bank: "", identityNumber: "", mobileNumber: "" });

  const data = dashboard.data;
  const levels = data?.levels || [];
  const activeLevel = levels.find(level => level.status === "active") || levels.find(level => level.status === "available") || levels[0];
  const ownPayments = data?.payments || [];
  const totalSent = ownPayments.filter(payment => payment.direction === "sent").reduce((sum, payment) => sum + payment.amount, 0);
  const totalReceived = ownPayments.filter(payment => payment.direction === "received").reduce((sum, payment) => sum + payment.amount, 0);
  const activeParticipant = data?.participants?.find(participant => participant.userId);
  const progress = activeLevel ? ((data?.participants?.filter(participant => participant.levelId === activeLevel.id).length || 0) / activeLevel.participantCount) * 100 : 0;

  const selectView = (view: "overview" | "account" | "history" | "admin") => { setActiveView(view); setMobileNav(false); };
  const beginEdit = () => { const profile = data?.profile; setProfileForm({ fullName: profile?.fullName || user?.name || "", phone: profile?.phone || "", bank: profile?.bank || "", identityNumber: profile?.identityNumber || "", mobileNumber: profile?.mobileNumber || "" }); setEditingProfile(true); };
  const saveProfile = async () => { try { await profileMutation.mutateAsync(profileForm); await utils.cooperative.dashboard.invalidate(); toast.success("Datos actualizados."); setEditingProfile(false); } catch (error: any) { toast.error(error?.message || "No se pudo actualizar el perfil."); } };
  const activate = async (levelNumber: number) => { try { await activateMutation.mutateAsync({ levelNumber }); await utils.cooperative.dashboard.invalidate(); toast.success(`Nivel ${levelNumber} activado.`); } catch (error: any) { toast.error(error?.message || "No se pudo activar el nivel."); } };

  if (loading) return <div className="loading-screen"><LogoMark /><span>Cargando tu cooperativa…</span></div>;
  if (!user) return <LoginScreen />;
  if (dashboard.isLoading) return <div className="loading-screen"><LogoMark /><span>Preparando tu espacio de ahorro…</span></div>;
  if (dashboard.error) return <div className="error-screen"><CircleHelp className="h-8 w-8" /><h2>No pudimos cargar tu cooperativa</h2><p>{dashboard.error.message}</p><Button className="primary-btn" onClick={() => dashboard.refetch()}>Intentar de nuevo</Button></div>;

  return <div className="app-shell"><aside className={`app-sidebar ${mobileNav ? "open" : ""}`}><div className="sidebar-brand"><LogoMark /><div><strong>Ahorro</strong><span>Cooperativo</span></div><button className="sidebar-close" onClick={() => setMobileNav(false)}><X className="h-4 w-4" /></button></div><div className="sidebar-user"><div className="avatar"><UserRound className="h-4 w-4" /></div><div><strong>{data?.profile?.fullName || user.name || "Participante"}</strong><span>Cuenta {data?.profile?.accountNumber || "0001"}</span></div></div><nav className="sidebar-nav"><p>MI ESPACIO</p><button className={activeView === "overview" ? "active" : ""} onClick={() => selectView("overview")}><LayoutDashboard className="h-4 w-4" /> Resumen</button><button className={activeView === "account" ? "active" : ""} onClick={() => selectView("account")}><UserRound className="h-4 w-4" /> Mi cuenta</button><button className={activeView === "history" ? "active" : ""} onClick={() => selectView("history")}><ReceiptText className="h-4 w-4" /> Historial de pagos</button>{user.role === "admin" && <><p className="sidebar-section">ADMINISTRACIÓN</p><button className={activeView === "admin" ? "active" : ""} onClick={() => selectView("admin")}><ShieldCheck className="h-4 w-4" /> Revisar comprobantes</button></>}<p className="sidebar-section">INFORMACIÓN</p><button onClick={() => toast.info("La guía de niveles estará disponible en la siguiente iteración.")}><CircleHelp className="h-4 w-4" /> Cómo funciona</button></nav><div className="sidebar-bottom"><div className="help-card"><Sparkles className="h-4 w-4" /><div><strong>Tu próximo paso</strong><span>{activeLevel?.status === "available" ? "Activa tu Nivel 1" : "Completa tu cultivo"}</span></div></div><button className="logout-btn" onClick={logout}><LogOut className="h-4 w-4" /> Cerrar sesión</button></div></aside><div className="mobile-overlay" onClick={() => setMobileNav(false)} /><main className="main-content"><header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu className="h-5 w-5" /></button><div><p className="eyebrow">SISTEMA DE AHORRO COOPERATIVO</p><h1>{activeView === "overview" ? "Tu resumen" : activeView === "account" ? "Mi cuenta" : activeView === "history" ? "Historial de pagos" : "Revisión administrativa"}</h1></div><div className="topbar-actions"><div className="live-pill"><span /> Sistema operativo</div><button className="topbar-avatar" onClick={() => selectView("account")}><span>{(user.name || "U").charAt(0).toUpperCase()}</span></button></div></header>{activeView === "overview" && <><section className="welcome-banner"><div><p className="eyebrow light">HOLA, {((data?.profile?.fullName || user.name || "PARTICIPANTE").split(" ")[0]).toUpperCase()}</p><h2>Haz crecer tu ahorro<br /><em>una posición a la vez.</em></h2><p>Tu cooperativa está lista para avanzar. Revisa el flujo, registra tus movimientos y mantén tus comprobantes en orden.</p></div><div className="banner-orbit"><div className="banner-coin">$</div><span className="orbit-dot dot-a" /><span className="orbit-dot dot-b" /><span className="orbit-dot dot-c" /></div></section><section className="stats-grid"><StatCard icon={BadgeDollarSign} label="Cultivo activo" value={formatMoney(activeLevel?.cultivationAmount)} detail={activeLevel ? `Nivel ${activeLevel.levelNumber}` : "Sin nivel activo"} tone="orange" /><StatCard icon={ArrowUpRight} label="Pagos realizados" value={formatMoney(totalSent)} detail={`${ownPayments.filter(p => p.direction === "sent").length} movimientos`} tone="blue" /><StatCard icon={ArrowDownLeft} label="Pagos recibidos" value={formatMoney(totalReceived)} detail={`${ownPayments.filter(p => p.direction === "received").length} movimientos`} tone="green" /><StatCard icon={UsersRound} label="Progreso del nivel" value={`${Math.round(progress)}%`} detail={`${data?.participants?.filter(p => p.levelId === activeLevel?.id).length || 0} de 12 lugares`} tone="violet" /></section><section className="section-heading"><div><p className="eyebrow">FLUJO DE AHORRO</p><h2>Tus niveles</h2></div><Button className="outline-action" variant="outline" onClick={() => setPaymentLevelId(activeLevel?.id || null)} disabled={!activeLevel}><ReceiptText className="mr-2 h-4 w-4" /> Registrar pago</Button></section><div className="levels-stack">{levels.map(level => <LevelFlow key={level.id} level={level} participants={data?.participants || []} selected={selectedLevelId === level.id} onSelect={() => setSelectedLevelId(level.id)} onActivate={() => activate(level.levelNumber)} />)}</div></>}{activeView === "account" && <section className="account-view"><div className="account-hero"><div className="account-avatar"><UserRound className="h-8 w-8" /></div><div><p className="eyebrow">PERFIL DE PARTICIPANTE</p><h2>{data?.profile?.fullName}</h2><p>Cuenta cooperativa N° {data?.profile?.accountNumber}</p></div><Button className="outline-action ml-auto" variant="outline" onClick={beginEdit}>{editingProfile ? "Cancelar" : "Editar datos"}</Button></div><div className="account-grid"><section className="info-card"><div className="card-title"><h3>Datos personales</h3><UserRound className="h-4 w-4" /></div>{editingProfile ? <div className="profile-form"><div><Label>Nombre completo</Label><Input value={profileForm.fullName} onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })} /></div><div><Label>Teléfono</Label><Input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} /></div><div><Label>Correo electrónico</Label><Input value={user.email || ""} disabled /></div><Button className="primary-btn" onClick={saveProfile} disabled={profileMutation.isPending}>{profileMutation.isPending ? "Guardando…" : "Guardar cambios"}</Button></div> : <dl className="info-list"><div><dt>Nombre completo</dt><dd>{data?.profile?.fullName || "—"}</dd></div><div><dt>Correo electrónico</dt><dd>{user.email || "—"}</dd></div><div><dt>Teléfono</dt><dd>{data?.profile?.phone || "Sin registrar"}</dd></div></dl>}</section><section className="info-card"><div className="card-title"><h3>Datos de cobro</h3><BadgeDollarSign className="h-4 w-4" /></div>{editingProfile ? <div className="profile-form"><div><Label>Banco</Label><Input value={profileForm.bank} onChange={e => setProfileForm({ ...profileForm, bank: e.target.value })} /></div><div><Label>Cédula / identidad</Label><Input value={profileForm.identityNumber} onChange={e => setProfileForm({ ...profileForm, identityNumber: e.target.value })} /></div><div><Label>Celular pago móvil</Label><Input value={profileForm.mobileNumber} onChange={e => setProfileForm({ ...profileForm, mobileNumber: e.target.value })} /></div></div> : <dl className="info-list"><div><dt>Banco</dt><dd>{data?.profile?.bank || "Sin registrar"}</dd></div><div><dt>Cédula / identidad</dt><dd>{data?.profile?.identityNumber || "Sin registrar"}</dd></div><div><dt>Celular pago móvil</dt><dd>{data?.profile?.mobileNumber || "Sin registrar"}</dd></div></dl>}</section></div></section>}{activeView === "history" && <section className="history-view"><div className="history-summary"><div><p className="eyebrow">TRAZABILIDAD</p><h2>Historial de movimientos</h2><p>Conserva el detalle de cada pago realizado o recibido.</p></div><Button className="primary-btn" onClick={() => setPaymentLevelId(activeLevel?.id || null)}><ReceiptText className="mr-2 h-4 w-4" /> Nuevo movimiento</Button></div><div className="history-table"><div className="history-row history-header"><span>Movimiento</span><span>Nivel</span><span>Monto</span><span>Estado</span><span>Fecha</span></div>{ownPayments.length ? ownPayments.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).map(payment => { const level = levels.find(item => item.id === payment.levelId); return <div className="history-row" key={payment.id}><span className="movement-cell"><span className={`movement-icon ${payment.direction}`} >{payment.direction === "sent" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}</span><strong>{payment.direction === "sent" ? "Pago realizado" : "Pago recibido"}<small>{payment.note || "Sin referencia"}</small></strong></span><span>Nivel {level?.levelNumber || "—"}</span><strong>{formatMoney(payment.amount)}</strong><Badge className={payment.status === "verified" ? "status-active" : payment.status === "rejected" ? "status-rejected" : "status-pending"}>{payment.status === "verified" ? "Verificado" : payment.status === "rejected" ? "Rechazado" : "Pendiente"}</Badge><span>{formatDate(payment.createdAt)}</span></div> }) : <div className="empty-state"><ReceiptText className="h-8 w-8" /><h3>Aún no hay movimientos</h3><p>Registra tu primer pago para comenzar el historial.</p></div>}</div></section>}{activeView === "admin" && <AdminReviewView data={adminPayments.data} isLoading={adminPayments.isLoading} onReview={async (paymentId, status) => { try { await reviewPayment.mutateAsync({ paymentId, status }); await adminPayments.refetch(); await utils.cooperative.dashboard.invalidate(); toast.success(status === "verified" ? "Comprobante aprobado." : "Comprobante rechazado."); } catch (error: any) { toast.error(error?.message || "No fue posible actualizar el comprobante."); } }} />}</main>{paymentLevelId && <PaymentModal levelId={paymentLevelId} onClose={() => setPaymentLevelId(null)} onSuccess={() => { utils.cooperative.dashboard.invalidate(); }} />}</div>;
}

function AdminReviewView({ data, isLoading, onReview }: { data?: { payments: any[]; profiles: any[]; levels: any[]; participants: any[] }; isLoading: boolean; onReview: (paymentId: number, status: "verified" | "rejected") => Promise<void> }) {
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("pending");
  const [exportLevel, setExportLevel] = useState("all");
  const [exportStatus, setExportStatus] = useState("all");
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const profileByUser = useMemo(() => new Map((data?.profiles || []).map(profile => [profile.userId, profile])), [data?.profiles]);
  const levelById = useMemo(() => new Map((data?.levels || []).map(level => [level.id, level])), [data?.levels]);
  const payments = (data?.payments || []).filter(payment => filter === "all" || payment.status === filter);
  const pendingCount = (data?.payments || []).filter(payment => payment.status === "pending").length;
  const inExportRange = (date: Date | string | null | undefined) => {
    const timestamp = date ? new Date(date).getTime() : 0;
    const from = exportFrom ? new Date(`${exportFrom}T00:00:00`).getTime() : -Infinity;
    const to = exportTo ? new Date(`${exportTo}T23:59:59.999`).getTime() : Infinity;
    return timestamp >= from && timestamp <= to;
  };
  const filteredPayments = (data?.payments || []).filter(payment =>
    (exportLevel === "all" || String(payment.levelId) === exportLevel) &&
    (exportStatus === "all" || payment.status === exportStatus) && inExportRange(payment.createdAt)
  );
  const filteredParticipants = (data?.participants || []).filter(participant =>
    (exportLevel === "all" || String(participant.levelId) === exportLevel) &&
    (exportStatus === "all" || (exportStatus === "active" ? participant.status !== "withdrawn" : participant.status === exportStatus)) && inExportRange(participant.registeredAt)
  );
  const totalPayments = filteredPayments.reduce((total, payment) => total + (payment.amount || 0), 0);
  const receivedPayments = filteredPayments.filter(payment => payment.direction === "received").reduce((total, payment) => total + (payment.amount || 0), 0);
  const sentPayments = filteredPayments.filter(payment => payment.direction === "sent").reduce((total, payment) => total + (payment.amount || 0), 0);
  const cultivationTotal = filteredParticipants.reduce((total, participant) => total + (participant.cultivationAmount || 0), 0);
  const exportPayments = () => {
    const rows = filteredPayments.map(payment => {
      const profile = profileByUser.get(payment.senderUserId || payment.receiverUserId);
      const level = levelById.get(payment.levelId);
      return [payment.id, profile?.fullName || "", profile?.accountNumber || "", payment.direction === "sent" ? "Realizado" : "Recibido", level?.levelNumber || "", formatMoney(payment.amount), payment.status === "verified" ? "Aprobado" : payment.status === "rejected" ? "Rechazado" : "Pendiente", payment.note || "", formatDate(payment.createdAt)];
    });
    downloadCsv(`historial-pagos-${new Date().toISOString().slice(0, 10)}.csv`, ["ID", "Participante", "Cuenta", "Tipo", "Nivel", "Monto", "Estado", "Nota", "Fecha"], rows);
    toast.success("Historial de pagos exportado.");
  };
  const exportParticipants = () => {
    const profileRows = new Map((data?.profiles || []).map(profile => [profile.userId, profile]));
    const levelRows = new Map((data?.levels || []).map(level => [level.id, level]));
    const rows = filteredParticipants.map(participant => {
      const profile = profileRows.get(participant.userId);
      const level = levelRows.get(participant.levelId);
      return [participant.id, profile?.fullName || "", profile?.accountNumber || participant.accountNumber || "", profile?.phone || "", level?.levelNumber || "", participant.position, participant.status === "withdrawn" ? "Inactivo" : participant.status === "paid" ? "Pagado" : "Activo", formatMoney(participant.cultivationAmount), formatDate(participant.registeredAt)];
    });
    downloadCsv(`historial-participantes-${new Date().toISOString().slice(0, 10)}.csv`, ["ID", "Participante", "Cuenta", "Teléfono", "Nivel", "Posición", "Estado", "Cultivo", "Fecha de registro"], rows);
    toast.success("Historial de participantes exportado.");
  };
  return <section className="admin-view"><div className="admin-hero"><div><p className="eyebrow light">CENTRO DE CONTROL</p><h2>Revisión de comprobantes</h2><p>Verifica cada captura antes de confirmar el movimiento en el flujo cooperativo.</p></div><div className="admin-hero-stat"><ShieldCheck className="h-5 w-5" /><strong>{pendingCount}</strong><span>pendientes</span></div></div><div className="admin-toolbar"><div><p className="eyebrow">BANDEJA DE REVISIÓN</p><h3>Movimientos enviados</h3></div><div className="export-filter-bar"><div><label>Nivel</label><select value={exportLevel} onChange={event => setExportLevel(event.target.value)}><option value="all">Todos los niveles</option>{(data?.levels || []).map(level => <option key={level.id} value={level.id}>Nivel {level.levelNumber}</option>)}</select></div><div><label>Estado</label><select value={exportStatus} onChange={event => setExportStatus(event.target.value)}><option value="all">Todos</option><option value="pending">Pendiente</option><option value="verified">Aprobado</option><option value="rejected">Rechazado</option><option value="active">Activo</option><option value="withdrawn">Inactivo</option><option value="paid">Pagado</option></select></div><div><label>Desde</label><input type="date" value={exportFrom} onChange={event => setExportFrom(event.target.value)} /></div><div><label>Hasta</label><input type="date" value={exportTo} onChange={event => setExportTo(event.target.value)} /></div><button className="clear-export-filters" onClick={() => { setExportLevel("all"); setExportStatus("all"); setExportFrom(""); setExportTo(""); }}>Limpiar</button><span className="export-count">{filteredPayments.length} pagos · {filteredParticipants.length} participantes</span></div><div className="export-summary"><div className="summary-heading"><div><p className="eyebrow">RESUMEN FILTRADO</p><strong>Montos seleccionados</strong></div><span>Se actualiza al cambiar los filtros</span></div><div className="summary-metrics"><div><small>Total movimientos</small><strong>{formatMoney(totalPayments)}</strong><em>{filteredPayments.length} registros</em></div><div><small>Pagos recibidos</small><strong className="received-total">{formatMoney(receivedPayments)}</strong><em>{filteredPayments.filter(payment => payment.direction === "received").length} registros</em></div><div><small>Pagos realizados</small><strong className="sent-total">{formatMoney(sentPayments)}</strong><em>{filteredPayments.filter(payment => payment.direction === "sent").length} registros</em></div><div><small>Cultivo participantes</small><strong className="cultivation-total">{formatMoney(cultivationTotal)}</strong><em>{filteredParticipants.length} participantes</em></div></div></div><div className="admin-export-actions"><Button size="sm" variant="outline" className="outline-action" onClick={exportParticipants}><FileCheck2 className="mr-1 h-3.5 w-3.5" /> Participantes CSV</Button><Button size="sm" variant="outline" className="outline-action" onClick={exportPayments}><FileCheck2 className="mr-1 h-3.5 w-3.5" /> Pagos CSV</Button></div><div className="filter-tabs">{(["pending", "verified", "rejected", "all"] as const).map(value => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value === "pending" ? "Pendientes" : value === "verified" ? "Aprobados" : value === "rejected" ? "Rechazados" : "Todos"}</button>)}</div></div><div className="admin-table">{isLoading ? <div className="empty-state"><span>Preparando bandeja…</span></div> : payments.length === 0 ? <div className="empty-state"><FileCheck2 className="h-8 w-8" /><h3>{filter === "pending" ? "Todo al día" : "Sin comprobantes"}</h3><p>No hay movimientos en este estado.</p></div> : payments.map(payment => { const profile = profileByUser.get(payment.senderUserId || payment.receiverUserId); const level = levelById.get(payment.levelId); return <article className="admin-payment-card" key={payment.id}><div className="admin-payment-main"><div className={`movement-icon ${payment.direction}`} >{payment.direction === "sent" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}</div><div><strong>{profile?.fullName || `Participante #${payment.senderUserId || payment.receiverUserId || "—"}`}</strong><span>{payment.direction === "sent" ? "Pago realizado" : "Pago recibido"} · Nivel {level?.levelNumber || "—"}</span><small>{payment.note || "Sin referencia"} · {formatDate(payment.createdAt)}</small></div></div><div className="admin-payment-amount"><strong>{formatMoney(payment.amount)}</strong><Badge className={payment.status === "verified" ? "status-active" : payment.status === "rejected" ? "status-rejected" : "status-pending"}>{payment.status === "verified" ? "Aprobado" : payment.status === "rejected" ? "Rechazado" : "Pendiente"}</Badge></div><div className="admin-payment-proof">{payment.proofUrl ? <a href={payment.proofUrl} target="_blank" rel="noreferrer"><img src={payment.proofUrl} alt="Comprobante de pago" /><span>Ver captura</span></a> : <span className="no-proof"><ImagePlus className="h-4 w-4" /> Sin imagen</span>}</div>{payment.status === "pending" && <div className="admin-payment-actions"><Button size="sm" className="approve-btn" onClick={() => onReview(payment.id, "verified")}><Check className="mr-1 h-3.5 w-3.5" /> Aprobar</Button><Button size="sm" variant="outline" className="reject-btn" onClick={() => onReview(payment.id, "rejected")}><X className="mr-1 h-3.5 w-3.5" /> Rechazar</Button></div>}</article>; })}</div></section>;
}

export default function Home() { return <AppShell />; }
