import svgPaths from "./svg-fje83nw5y4";

function Icon() {
  return (
    <div className="absolute left-[16px] size-[15.996px] top-[8.99px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g id="Icon">
          <path d={svgPaths.pf862b00} id="Vector" stroke="var(--stroke-0, #19A589)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p690f700} id="Vector_2" stroke="var(--stroke-0, #19A589)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p33842370} id="Vector_3" stroke="var(--stroke-0, #19A589)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
      </svg>
    </div>
  );
}

export default function Button() {
  return (
    <div className="bg-white border-[#e5e7eb] border-[0.633px] border-solid relative rounded-[21243700px] size-full" data-name="Button">
      <Icon />
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[18px] left-[64.49px] not-italic text-[#19a589] text-[12px] text-center top-[7.73px] whitespace-nowrap">Template</p>
    </div>
  );
}