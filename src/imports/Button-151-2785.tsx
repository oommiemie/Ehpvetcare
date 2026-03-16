import svgPaths from "./svg-7n4pmiuhuk";

function Icon() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d={svgPaths.p13063080} id="Vector" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[47.553px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[24px] not-italic text-[#6a7282] text-[12px] text-center top-[0.1px] whitespace-nowrap">ย้อนกลับ</p>
      </div>
    </div>
  );
}

export default function Button() {
  return (
    <div className="bg-[rgba(255,255,255,0.5)] content-stretch flex gap-[3.997px] items-center pl-[11.999px] relative rounded-[21243700px] size-full" data-name="Button">
      <Icon />
      <Text />
    </div>
  );
}