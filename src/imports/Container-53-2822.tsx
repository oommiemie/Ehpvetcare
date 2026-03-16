import svgPaths from "./svg-2s41y0kzu1";

function Printer() {
  return (
    <div className="relative shrink-0 size-[11.999px]" data-name="Printer">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g clipPath="url(#clip0_53_2826)" id="Printer">
          <path d={svgPaths.p2a819b00} id="Vector" stroke="var(--stroke-0, #3B82F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p37d1ef00} id="Vector_2" stroke="var(--stroke-0, #3B82F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p36fb8a80} id="Vector_3" stroke="var(--stroke-0, #3B82F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
        <defs>
          <clipPath id="clip0_53_2826">
            <rect fill="white" height="11.9995" width="11.9995" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[50.481px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[25.5px] not-italic text-[#3b82f6] text-[12px] text-center top-[0.1px] whitespace-nowrap">พิมพ์บัตร</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(255,255,255,0.7)] h-[29.252px] relative rounded-[21243700px] shrink-0 w-[93.74px]" data-name="button">
      <div aria-hidden="true" className="absolute border-[0.633px] border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[5.995px] items-center pl-[12.632px] pr-[0.633px] py-[0.633px] relative size-full">
        <Printer />
        <Span />
      </div>
    </div>
  );
}

function Edit() {
  return (
    <div className="relative shrink-0 size-[11.999px]" data-name="Edit2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g clipPath="url(#clip0_53_2243)" id="Edit2">
          <path d={svgPaths.p2dda5b80} id="Vector" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
        <defs>
          <clipPath id="clip0_53_2243">
            <rect fill="white" height="11.9995" width="11.9995" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span1() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[29.766px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[15px] not-italic text-[#6a7282] text-[12px] text-center top-[0.1px] whitespace-nowrap">แก้ไข</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[rgba(255,255,255,0.7)] h-[29.252px] relative rounded-[21243700px] shrink-0 w-[73.026px]" data-name="button">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[5.995px] items-center pl-[12.999px] pr-px py-px relative size-full">
        <Edit />
        <Span1 />
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex gap-[5.995px] items-start pt-[3.997px] relative size-full" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}