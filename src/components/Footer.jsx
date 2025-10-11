export default function Footer() {
    return (
        <div className="text-blue-gray-600">
            <footer className="py-2">
                <div className="flex w-full flex-wrap items-center justify-center gap-6 px-2 md:justify-between">
                    <p className="block antialiased font-sans text-sm leading-normal font-normal text-inherit">© {new Date().getFullYear()} <a href="https://facultad" target="_blank" className="transition-colors hover:text-blue-500">Universidad Autonoma de Chiapas </a> - UNACH.</p>
                    <ul className="flex items-center gap-4">
                        <li>
                            <a href="#" target="_blank" className="block antialiased font-sans text-sm leading-normal py-0.5 px-1 font-normal text-inherit transition-colors hover:text-blue-500">Creative Tim</a>
                        </li>
                        <li>
                            <a href="#" target="_blank" className="block antialiased font-sans text-sm leading-normal py-0.5 px-1 font-normal text-inherit transition-colors hover:text-blue-500">About Us</a>
                        </li>
                        <li>
                            <a href="#" target="_blank" className="block antialiased font-sans text-sm leading-normal py-0.5 px-1 font-normal text-inherit transition-colors hover:text-blue-500">Blog</a>
                        </li>
                        <li>
                            <a href="#" target="_blank" className="block antialiased font-sans text-sm leading-normal py-0.5 px-1 font-normal text-inherit transition-colors hover:text-blue-500">License</a>
                        </li>
                    </ul>
                </div>
            </footer>
        </div>
    )
}
