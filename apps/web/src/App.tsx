import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import styles from "./components/layout.module.scss";
import { SiteHeader } from "./components/Header";
import { useI18n } from "./i18n/I18nContext";
import { AboutPage } from "./pages/AboutPage";
import { ExperimentDetailPage } from "./pages/ExperimentDetailPage";
import { HomePage } from "./pages/HomePage";
import { QuizPage } from "./pages/QuizPage";
import { RenderDashboardPage } from "./pages/RenderDashboardPage";
import { ReportPage } from "./pages/ReportPage";
import { VirtualOpsPage } from "./pages/VirtualOpsPage";

function NotFound() {
  const { t } = useI18n();
  return (
    <div className={styles.empty}>
      <p>404</p>
      <Link to="/" className={styles.navLink}>
        {t("detail.returnHome")}
      </Link>
    </div>
  );
}

export default function App() {
  const { t } = useI18n();
  return (
    <BrowserRouter>
      <div className={styles.page}>
        <SiteHeader />
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/experiment/:id" element={<ExperimentDetailPage />} />
            <Route path="/experiment/:id/virtual" element={<VirtualOpsPage />} />
            <Route path="/experiment/:id/report" element={<ReportPage />} />
            <Route path="/experiment/:id/quiz" element={<QuizPage />} />
            <Route path="/render" element={<RenderDashboardPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            {t("footer.disclaimer")} · 示意动画，非真实操作录像 / Illustrative animations, not real recordings
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
