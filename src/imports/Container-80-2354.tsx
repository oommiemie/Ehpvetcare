function Button() {
  return (
    <div className="bg-[#498a4f] relative rounded-[21243700px] shrink-0 w-[130px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center py-[8px] relative w-full">
        <p className="font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[16px] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">ชำระเงินจาก Visit</p>
      </div>
    </div>
  );
}

function Span() {
  return (
    <div className="bg-[#d1d5db] h-[16.787px] relative rounded-[21243700px] shrink-0 w-[30.815px]" data-name="span">
      <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[12.8px] left-[15.49px] not-italic text-[9.6px] text-center text-white top-[2.1px] whitespace-nowrap">POS</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="relative rounded-[21243700px] shrink-0 w-[130px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-center justify-center px-[16px] py-[6px] relative w-full">
        <p className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#6a7282] text-[12px] text-center whitespace-nowrap">ขายปลีก</p>
        <Span />
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[rgba(255,255,255,0.9)] content-stretch flex items-start pl-[3.997px] pt-[3.997px] relative rounded-[21243700px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)] size-full" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}