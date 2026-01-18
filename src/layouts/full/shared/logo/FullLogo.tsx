import LogoIcon from 'src/assets/images/logos/logo-icon.svg'

export default function FullLogo() {
  return (
    <div className="flex items-center gap-2">
      <img src={LogoIcon} alt="Parim" className="h-8 w-8" />
      <h3 className="font-semibold tracking-tight text-foreground">Parim Pro</h3>
    </div>
  )
}
