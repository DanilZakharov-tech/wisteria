export type AlinaEmotion = 'neutral' | 'smile' | 'thoughtful' | 'surprised' | 'determined' | 'happy';
const positions: Record<AlinaEmotion,string> = {neutral:'35.7% 10%',smile:'66% 10%',thoughtful:'96.5% 10%',surprised:'35.7% 94%',determined:'66% 94%',happy:'96.5% 94%'};
const labels:Record<AlinaEmotion,string>={neutral:'спокойная',smile:'улыбается',thoughtful:'задумалась',surprised:'удивлена',determined:'решительная',happy:'радуется'};
export default function AlinaPortrait({emotion='neutral'}:{emotion?:AlinaEmotion}){
 return <div className="alina-expression" role="img" aria-label={`Алина — ${labels[emotion]}`} style={{backgroundPosition:positions[emotion]}}/>;
}