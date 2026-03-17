import svgPaths from "./svg-pxaodt0vwc";
import imgPet from "figma:asset/da8cd26150a5d3079b941efb6b052bf596754082.png";

function Icon() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g clipPath="url(#clip0_217_7435)" id="Icon">
          <path d={svgPaths.p11e552f0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
        <defs>
          <clipPath id="clip0_217_7435">
            <rect fill="white" height="15.996" width="15.996" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container1() {
  return (
    <div className="flex-[1_0_0] h-[19.993px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.993px] items-center relative size-full">
        <Icon />
        <p className="font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">ทะเบียนพันธุ์สัตว์</p>
        <p className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[12px] text-[rgba(255,255,255,0.7)] whitespace-nowrap">Breed Registry</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
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
    <div className="relative rounded-[21243700px] shrink-0" data-name="Button" style={{ backgroundImage: "linear-gradient(161.2deg, rgb(232, 128, 42) 0%, rgb(208, 106, 26) 100%)" }}>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[21243700px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-px items-center px-[16px] py-[8px] relative">
        <Icon1 />
        <p className="font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">เพิ่มพันธ์ุ</p>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="relative size-full" data-name="Container" style={{ backgroundImage: "linear-gradient(174.998deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)" }}>
      <div className="content-stretch flex gap-[11.999px] items-center pb-[24.633px] pt-[24px] px-[23.999px] relative size-full">
        <div className="absolute h-[99px] right-[-0.02px] top-[-15.82px] w-[100px]" data-name="Pet">
          <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden pointer-events-none">
            <img alt="" className="absolute left-[-10.5%] max-w-none size-[121%] top-[-10.5%]" src={imgPet} />
          </div>
        </div>
        <Container1 />
        <Button />
      </div>
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}