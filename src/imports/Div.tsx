import svgPaths from "./svg-r9hx6dckyv";

function Input() {
  return (
    <div className="absolute bg-[#f9fafb] h-[37.245px] left-0 rounded-[21243700px] top-0 w-[255.372px]" data-name="input">
      <div className="content-stretch flex items-center overflow-clip pl-[36px] pr-[12px] py-[8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular','Noto_Sans_Thai:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[14px] text-[rgba(10,10,10,0.5)] tracking-[-0.1504px]">ค้นหาชื่อ, เบอร์โทร, บัตรประชาชน...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
    </div>
  );
}

function Search() {
  return (
    <div className="absolute left-[12px] size-[15.996px] top-[10.62px]" data-name="Search">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g id="Search">
          <path d={svgPaths.p1ac02680} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p18cccdc0} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
      </svg>
    </div>
  );
}

export default function Div() {
  return (
    <div className="relative size-full" data-name="div">
      <Input />
      <Search />
    </div>
  );
}