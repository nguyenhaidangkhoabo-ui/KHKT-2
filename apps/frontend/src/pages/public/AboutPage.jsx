import { History, Award, BookOpen, User, GraduationCap, School, Check, BookmarkCheck } from 'lucide-react'
import { APP_CONFIG } from '../../config/app.config'

export default function AboutPage() {
  const historyTimeline = [
    {
      year: '1959',
      title: 'Trường Trung học Trần Quốc Tuấn',
      content: 'Thành lập tại vùng đất Chiến khu Đ kiên cường. Năm học đầu tiên 1959–1960 chỉ có một lớp Đệ thất (lớp 6 ngày nay) với hơn 50 học sinh, 2 giáo viên và 1 giám thị, mượn tạm phòng học của trường Tiểu học Tân Uyên.',
    },
    {
      year: '1961',
      title: 'Trường Trung học Phước Thành',
      content: 'Đổi tên theo địa danh tỉnh Phước Thành (đồng thời để tránh trùng tên với trường Trần Quốc Tuấn ở Quảng Ngãi), tiếp tục mở rộng quy mô đào tạo.',
    },
    {
      year: '1966 – 1967',
      title: 'Mở các lớp Đệ nhị cấp (Cấp 3)',
      content: 'Trường bắt đầu giảng dạy bậc cấp 3. Con em nhân dân địa phương có thể tiếp tục học trung học ngay tại quê nhà, không còn phải chuyển về Bình Dương, Sài Gòn hay Biên Hòa.',
    },
    {
      year: '1973',
      title: 'Trường Trung học Tân Uyên',
      content: 'Trường chính thức mang tên quận Tân Uyên, gắn bó mật thiết với đồng bào vùng đất anh hùng.',
    },
    {
      year: '1975',
      title: 'Trường Phổ thông Cấp 2, 3 Tân Uyên',
      content: 'Sau ngày thống nhất non sông 30/4/1975, trường tiếp nhận tên gọi mới và tiếp tục thực hiện sứ mệnh giáo dục trong giai đoạn tái thiết đất nước.',
    },
    {
      year: '1976',
      title: 'Trường PTTH Tân Uyên I',
      content: 'Các lớp cấp 2 được tách ra để thành lập trường PTCS Uyên Hưng, nhà trường chính thức mang tên PTTH Tân Uyên I và chuyên tâm đào tạo bậc trung học phổ thông.',
    },
    {
      year: 'Từ năm 1992',
      title: 'Trường THPT Huỳnh Văn Nghệ',
      content: 'Trường vinh dự được mang tên nhà thơ, chiến sĩ, vị tướng tài ba của vùng đất Tân Uyên – Chiến khu Đ: Thi tướng Huỳnh Văn Nghệ.',
    },
    {
      year: '2024',
      title: 'Kỷ niệm 65 năm xây dựng và phát triển (1959 – 2024)',
      content: 'Trường long trọng tổ chức lễ kỷ niệm 65 năm ngày thành lập, ghi dấu chặng đường vẻ vang với Huân chương Lao động hạng Ba và trường đạt Chuẩn Quốc gia.',
    },
  ]

  const achievements = [
    { year: '1999', title: 'Huân chương Lao động hạng Ba', desc: 'Chủ tịch nước Trần Đức Lương trao tặng.' },
    { year: '2010', title: 'Đạt chuẩn Quốc gia', desc: 'UBND tỉnh Bình Dương chính thức công nhận.' },
    { year: 'Nhiều năm', title: 'Bằng khen của Thủ tướng Chính phủ', desc: 'Khen thưởng tập thể nhà trường có thành tích xuất sắc.' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 font-sans">
      <div className="text-center space-y-3">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
          Trường THPT Huỳnh Văn Nghệ <br />
          <span className="text-primary font-bold text-xl sm:text-2xl">Hành trình 65 năm xây dựng và phát triển (1959 – 2024)</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Trường THPT Huỳnh Văn Nghệ là một trong những ngôi trường có bề dày lịch sử lâu đời tại tỉnh Bình Dương, với 65 năm hình thành và phát triển gắn liền với vùng đất Tân Uyên anh hùng.
        </p>
      </div>

      <section className="space-y-6 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              Thi tướng Huỳnh Văn Nghệ (1914 – 1977)
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Trường được mang tên <strong>Huỳnh Văn Nghệ</strong>, một nhà hoạt động cách mạng và chỉ huy quân sự tài ba, được nhân dân yêu quý gọi là <strong>"Thi tướng rừng xanh"</strong>. Ông sinh tại làng Tân Tịch, vùng đất Tân Uyên, từng tham gia Tổng khởi nghĩa Tháng Tám năm 1945, trực tiếp chỉ huy giành chính quyền ở Biên Hòa.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Huỳnh Văn Nghệ không chỉ là một nhà quân sự xuất sắc mà còn là một thi sĩ với những vần thơ đi cùng năm tháng. Ông được truy tặng danh hiệu <strong>Anh hùng Lực lượng vũ trang nhân dân</strong> (2010) và <strong>Giải thưởng Nhà nước về Văn học Nghệ thuật</strong>. Với tài năng cả văn lẫn võ, ông là tấm gương sáng cho các thế hệ học sinh noi theo.
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-2.5">
            <div className="relative group overflow-hidden rounded-xl shadow-xl border-4 border-white max-w-xs w-full aspect-[383/522]">
              <img
                src="/thi_tuong_hvn.png"
                alt="Chân dung Thi tướng Huỳnh Văn Nghệ"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                <div className="space-y-1 drop-shadow-md text-center">
                  <p className="italic text-xs sm:text-sm font-medium text-amber-200 leading-relaxed">
                    "Từ thuở mang gươm đi mở cõi <br />
                    Trời Nam thương nhớ đất Thăng Long"
                  </p>
                  <p className="text-[10px] text-slate-300 font-light">
                    — Trích bài thơ <em>Nhớ Bắc</em> (1940)
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center pt-0.5">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                Huỳnh Văn Nghệ <span className="text-slate-500 font-normal text-xs">(1914 – 1977)</span>
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            <span>Lịch sử hình thành & Các mốc son</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Trải qua từng giai đoạn lịch sử khốc liệt của chiến tranh cho đến hòa bình xây dựng đất nước.
          </p>
        </div>

        <div className="relative border-l-2 border-primary-200 ml-4 pl-6 sm:pl-8 space-y-8">
          {historyTimeline.map((item, idx) => (
            <div key={idx} className="relative group">
              <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-primary group-hover:scale-125 transition-transform" />
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-primary-100 text-primary font-bold text-xs">
                  {item.year}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <School className="w-5 h-5 text-primary" />
            <span>Phát triển & Quy mô hiện nay</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Từ ngôi trường nhỏ với vài thầy cô, đến nay trường đã có cơ sở vật chất khang trang, hiện đại:
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>29 Lớp học</strong> với trang thiết bị dạy học hiện đại</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>88 Cán bộ - Giáo viên - Nhân viên</strong> tận tụy</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Trong đó có <strong>8 Thạc sĩ</strong> và <strong>69 Cử nhân</strong></span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <span>Thành tựu & Khen thưởng</span>
          </h3>
          <div className="space-y-3">
            {achievements.map((a, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{a.title}</h4>
                  <span className="text-[11px] font-semibold text-primary">{a.year}</span>
                </div>
                <p className="text-[11px] text-slate-500">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200/80 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span>Định hướng đào tạo</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Nhà trường triển khai mô hình đào tạo hiện đại, lấy học sinh làm trung tâm, kết hợp giữa chương trình chuẩn của Bộ Giáo dục với đổi mới sáng tạo trong dạy và học. Chú trọng thảo luận nhóm, học theo dự án, thực hành trải nghiệm và ứng dụng mạnh mẽ công nghệ thông tin.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>Phương thức tuyển sinh</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Trường tuyển sinh qua kỳ thi tuyển sinh lớp 10 do Sở GD&ĐT tỉnh Bình Dương tổ chức hàng năm, với 3 môn thi bắt buộc: <strong>Toán, Ngữ văn và Ngoại ngữ</strong>.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 italic text-center">
          "Trải qua hơn 6 thập kỷ, Trường THPT Huỳnh Văn Nghệ tiếp tục viết tiếp những trang sử vàng trong sự nghiệp trồng người."
        </div>
      </section>
    </div>
  )
}
