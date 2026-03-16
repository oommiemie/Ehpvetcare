import svgPaths from "./svg-sa3d9o90u1";

function LayoutList() {
  return (
    <div className="absolute left-[16.63px] size-[13.998px] top-[9.63px]" data-name="LayoutList">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="LayoutList">
          <path d={svgPaths.p3dda7600} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p2fd4c800} id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M8.16534 2.33295H12.248" id="Vector_3" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M8.16534 5.24915H12.248" id="Vector_4" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M8.16534 8.74858H12.248" id="Vector_5" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M8.16534 11.6648H12.248" id="Vector_6" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

export default function Button() {
  return (
    <div className="bg-white relative rounded-[21243700px] size-full" data-name="button">
      <LayoutList />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[72.62px] not-italic text-[#4a5565] text-[12px] text-center top-[8.73px] whitespace-nowrap">ประวัติวัคซีน</p>
    </div>
  );
}