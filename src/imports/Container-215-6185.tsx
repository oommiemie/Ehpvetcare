import svgPaths from "./svg-kfb9yozat5";
import imgImage19 from "figma:asset/06e1c759c341a01d94357ce5f310930d6ac67fec.png";

function Icon() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g clipPath="url(#clip0_117_4556)" id="Icon">
          <path d={svgPaths.p17774600} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p38b71c00} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
        <defs>
          <clipPath id="clip0_117_4556">
            <rect fill="white" height="15.996" width="15.996" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[65.31px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[20px] left-0 not-italic text-[14px] text-white top-[0.1px] whitespace-nowrap">รายการยา</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[72.333px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[12px] text-[rgba(255,255,255,0.7)] top-[0.1px] whitespace-nowrap">Drug Registry</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="flex-[1_0_0] h-[19.993px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.993px] items-center relative size-full">
        <Icon />
        <Text />
        <Text1 />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[16px] size-[13.998px] top-[8.99px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d="M2.91619 6.99886H11.0815" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 2.91619V11.0815" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[31.992px] relative rounded-[21243700px] shrink-0 w-[87.36px]" data-name="Button" style={{ backgroundImage: "linear-gradient(159.887deg, rgb(232, 128, 42) 0%, rgb(208, 106, 26) 100%)" }}>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[21243700px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon1 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-[53.99px] not-italic text-[12px] text-center text-white top-[8.09px] whitespace-nowrap">เพิ่มยา</p>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex gap-[11.999px] items-center pb-[24.633px] pt-[24px] px-[23.999px] relative size-full" data-name="Container" style={{ backgroundImage: "linear-gradient(174.998deg, rgb(59, 130, 246) 0%, rgb(29, 78, 216) 100%)" }}>
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
      <div className="absolute bottom-[0.58px] right-[0.98px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] size-[110px]" data-name="image 19">
        <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage19} />
      </div>
      <Container1 />
      <Button />
    </div>
  );
}