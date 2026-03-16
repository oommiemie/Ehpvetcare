function Button() {
  return (
    <div className="bg-[#498a4f] h-[31.982px] relative rounded-[21243700px] shrink-0 w-[89.991px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[45.34px] not-italic text-[12px] text-center text-white top-[8.09px] whitespace-nowrap">รายวัน</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[31.982px] relative rounded-[21243700px] shrink-0 w-[89.991px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[18px] left-[45.23px] not-italic text-[#6a7282] text-[12px] text-center top-[8.09px] whitespace-nowrap">รายสัปดาห์</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="h-[31.982px] relative rounded-[21243700px] shrink-0 w-[89.991px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[45.23px] not-italic text-[#6a7282] text-[12px] text-center top-[8.09px] whitespace-nowrap">รายเดือน</p>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[rgba(255,255,255,0.9)] content-stretch flex items-start pl-[3.997px] pt-[3.997px] relative rounded-[21243700px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)] size-full" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
    </div>
  );
}