import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-4 animate-bounce-slow">🐻</div>
      <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
        KiddyFit
      </h1>
      <p className="text-muted-foreground mb-8 max-w-xs">
        Theo dõi cân nặng và chiều cao của bạn mỗi ngày!
      </p>
      <Link
        href="/auth/login"
        className="btn-primary text-lg px-8 py-3"
      >
        Đăng nhập
      </Link>
    </div>
  );
}
