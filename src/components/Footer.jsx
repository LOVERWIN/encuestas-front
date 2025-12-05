export default function Footer() {
    return (
        <div className="text-blue-gray-600">
            <footer className="py-2">
                <div className="flex w-full flex-wrap items-center justify-center gap-6 px-2 md:justify-between">
                    <p className="block antialiased font-sans text-sm leading-normal font-normal text-inherit">© {new Date().getFullYear()} <a href="https://negocios.unach.mx/" target="_blank" className="transition-colors hover:text-blue-500">Universidad Autonoma de Chiapas - Facultad de Negocios Campus IV. </a> </p>
                    
                </div>
            </footer>
        </div>
    )
}
