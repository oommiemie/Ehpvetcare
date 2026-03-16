import svgPaths from "./svg-czz8c1ybdu";

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

function Span() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[29.766px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[15px] not-italic text-[#6a7282] text-[12px] text-center top-[0.1px] whitespace-nowrap">แก้ไข</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(255,255,255,0.7)] h-[29.252px] relative rounded-[21243700px] shrink-0 w-[73.026px]" data-name="button">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[5.995px] items-center pl-[12.999px] pr-px py-px relative size-full">
        <Edit />
        <Span />
      </div>
    </div>
  );
}

function Trash() {
  return (
    <div className="relative shrink-0 size-[11.999px]" data-name="Trash2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9995 11.9995">
        <g clipPath="url(#clip0_53_2246)" id="Trash2">
          <path d="M1.49993 2.99987H10.4995" id="Vector" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p28b632c0} id="Vector_2" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d={svgPaths.p3807fe80} id="Vector_3" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d="M4.99978 5.49975V8.49962" id="Vector_4" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
          <path d="M6.99969 5.49975V8.49962" id="Vector_5" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999955" />
        </g>
        <defs>
          <clipPath id="clip0_53_2246">
            <rect fill="white" height="11.9995" width="11.9995" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Span1() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[15.917px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[8px] not-italic text-[#ff6467] text-[12px] text-center top-[0.1px] whitespace-nowrap">ลบ</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[rgba(255,255,255,0.7)] h-[29.252px] relative rounded-[21243700px] shrink-0 w-[59.176px]" data-name="button">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[21243700px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[5.995px] items-center pl-[12.999px] pr-px py-px relative size-full">
        <Trash />
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