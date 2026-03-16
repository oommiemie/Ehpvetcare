import svgPaths from "./svg-tkzsp1svda";

function Input() {
  return (
    <div className="absolute bg-[#f9fafb] h-[37.245px] left-0 rounded-[14px] top-0 w-[373.388px]" data-name="input">
      <div className="content-stretch flex items-center overflow-clip pl-[36px] pr-[12px] py-[8px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular','Noto_Sans_Thai:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#d1d5dc] text-[14px] tracking-[-0.1504px]">เช่น HN-00123</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function Hash() {
  return (
    <div className="absolute left-[12px] size-[15.996px] top-[10.62px]" data-name="Hash">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g id="Hash">
          <path d="M2.666 5.99849H13.33" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d="M2.666 9.99749H13.33" id="Vector_2" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p15af2880} id="Vector_3" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p3acd3f80} id="Vector_4" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
      </svg>
    </div>
  );
}

export default function Container() {
  return (
    <div className="relative size-full" data-name="Container">
      <Input />
      <Hash />
    </div>
  );
}