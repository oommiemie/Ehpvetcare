import svgPaths from "./svg-qvgdj63kk2";

function Button() {
  return (
    <div className="relative rounded-[21243700px] shrink-0 w-[110px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[17px] py-[9px] relative w-full">
        <p className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#4a5565] text-[14px] text-center whitespace-nowrap">ยกเลิก</p>
      </div>
    </div>
  );
}

function Check() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Check">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g id="Check">
          <path d={svgPaths.p3d943d00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#498a4f] h-[38px] opacity-40 relative rounded-[21243700px] shrink-0 w-[110px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[20px] py-[9px] relative size-full">
        <Check />
        <p className="font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">บันทึก</p>
      </div>
    </div>
  );
}

export default function Div() {
  return (
    <div className="bg-white content-stretch flex items-start justify-between pl-[19.992px] pr-[19.993px] pt-[16.629px] relative rounded-bl-[24px] rounded-br-[24px] size-full" data-name="div">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-solid border-t-[0.633px] inset-0 pointer-events-none rounded-bl-[24px] rounded-br-[24px]" />
      <Button />
      <Button1 />
    </div>
  );
}