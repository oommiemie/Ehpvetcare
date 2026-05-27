import { Component, ReactNode } from "react";
import { AlertTriangle, RotateCcw, Trash2 } from "lucide-react";

interface State {
  hasError: boolean;
  error?: Error;
}

export class IPDErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("IPD Error:", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  clearStorage = () => {
    if (!confirm("ล้างข้อมูล IPD ทั้งหมด (localStorage)?\nข้อมูลจะกลับไปเป็น mock เริ่มต้น")) return;
    localStorage.removeItem("ehp_ipd_state_v1");
    localStorage.removeItem("ehp_ipd_state_v2");
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 min-h-full flex items-center justify-center" style={{ background: "#FEFBF8" }}>
          <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-gray-100 max-w-[480px]" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, #f87171, #dc2626)" }}>
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div className="text-[15px] text-gray-900" style={{ fontWeight: 700 }}>หน้านี้เกิดข้อผิดพลาด</div>
            <div className="text-[12px] text-gray-500 mt-1" style={{ lineHeight: 1.5 }}>
              อาจเป็นข้อมูลใน localStorage เก่าที่ไม่ตรงกับโครงสร้างใหม่
            </div>
            {this.state.error && (
              <div className="mt-3 px-3 py-2 rounded-lg text-[11px] text-rose-700 max-w-full overflow-auto" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.20)", fontFamily: "monospace" }}>
                {this.state.error.message}
              </div>
            )}
            <div className="flex items-center gap-2 mt-4">
              <button onClick={this.reset} className="vet-btn vet-btn-secondary inline-flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> ลองใหม่
              </button>
              <button onClick={this.clearStorage} className="vet-btn vet-btn-danger inline-flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" /> ล้างข้อมูล + รีโหลด
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
