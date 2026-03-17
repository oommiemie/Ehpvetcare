import svgPaths from "./svg-jga1q0r3cj";
import imgDoctor from "figma:asset/38108e79459bb2b9651de437b75b70a9a555c6fe.png";

function Icon() {
  return (
    <div className="h-[13.998px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.8312 12.8312">
            <path d={svgPaths.peaedb00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.17%_37.5%_45.83%_37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.66591 4.66591">
            <path d={svgPaths.p44b8180} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[70.83%_29.17%_13.91%_29.17%]" data-name="Vector">
        <div className="absolute inset-[-27.31%_-10%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.99886 3.3023">
            <path d={svgPaths.p136fea00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 size-[13.998px]" data-name="Text">
      <Icon />
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[89.576px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[20px] left-0 not-italic text-[14px] text-white top-[0.1px] whitespace-nowrap">ทะเบียนบุคลากร</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative">
        <Text />
        <Text1 />
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[88.487px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[12px] text-[rgba(255,255,255,0.7)] top-[0.1px] whitespace-nowrap">Personnel Registry</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[24px] relative">
        <Text2 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start justify-center relative w-full">
        <Frame />
        <Frame1 />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d="M2.91619 6.99886H11.0815" id="Vector" stroke="var(--stroke-0, #E8802A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 2.91619V11.0815" id="Vector_2" stroke="var(--stroke-0, #E8802A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="relative rounded-[21243700px] shrink-0" data-name="Button" style={{ backgroundImage: "linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%), linear-gradient(164.45deg, rgb(232, 128, 42) 0%, rgb(208, 106, 26) 100%)" }}>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[21243700px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-px items-center px-[16px] py-[8px] relative">
        <Icon1 />
        <p className="font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#e8802a] text-[12px] text-center whitespace-nowrap">เพิ่มบุคลากร</p>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="relative size-full" data-name="Container" style={{ backgroundImage: "linear-gradient(174.852deg, rgb(139, 92, 246) 0%, rgba(124, 58, 237, 0.5) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <div className="content-stretch flex gap-[11.999px] items-center pb-[24.633px] pt-[24px] px-[23.999px] relative size-full">
        <div className="absolute h-[149px] opacity-70 right-[-22.01px] top-[-24px] w-[150px]" data-name="doctor">
          <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover pointer-events-none size-full" src={imgDoctor} />
        </div>
        <Container1 />
        <Button />
      </div>
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}