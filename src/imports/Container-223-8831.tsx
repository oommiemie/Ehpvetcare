import svgPaths from "./svg-iuf8rqf7o7";
import imgSevice from "figma:asset/2d18f6929a57bb9f599514b4d247d99a664978ee.png";

function Icon() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g clipPath="url(#clip0_220_8084)" id="Icon">
          <path d={svgPaths.p12ea7100} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
        <defs>
          <clipPath id="clip0_220_8084">
            <rect fill="white" height="15.996" width="15.996" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[19.993px] relative shrink-0 w-[89.576px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[20px] left-0 not-italic text-[14px] text-white top-[0.1px] whitespace-nowrap">ทะเบียนค่าบริการ</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative">
        <Icon />
        <Text />
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[15.996px] relative shrink-0 w-[88.487px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[12px] text-[rgba(255,255,255,0.7)] top-[0.1px] whitespace-nowrap">Service Registry</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[24px] relative">
        <Text1 />
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
    <div className="bg-white relative rounded-[21243700px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[21243700px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-px items-center px-[16px] py-[8px] relative">
        <Icon1 />
        <p className="font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#e8802a] text-[12px] text-center whitespace-nowrap">เพิ่มบริการ</p>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="relative size-full" data-name="Container" style={{ backgroundImage: "linear-gradient(174.852deg, rgb(232, 128, 42) 0%, rgba(208, 106, 26, 0.5) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <div className="content-stretch flex gap-[11.999px] items-center pb-[24.633px] pt-[24px] px-[23.999px] relative size-full">
        <div className="absolute opacity-70 right-[-25px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] size-[150px] top-[-16px]" data-name="sevice">
          <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden pointer-events-none">
            <img alt="" className="absolute left-[-18.6%] max-w-none size-[142%] top-[-20.99%]" src={imgSevice} />
          </div>
        </div>
        <Container1 />
        <Button />
      </div>
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}