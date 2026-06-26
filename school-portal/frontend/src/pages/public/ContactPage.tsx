import { useQuery } from '@tanstack/react-query'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { publicApi } from '@/api/public'

export default function ContactPage() {
  const { data } = useQuery({
    queryKey: ['contact'],
    queryFn: publicApi.contact,
    staleTime: 30 * 60_000,
  })

  const info = data?.data?.info ?? {}

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Contact Us</h1>
        <p className="text-surface-500 mt-2">We'd love to hear from you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="space-y-4">
          {[
            { icon: <MapPin size={20} />, label: 'Address',  value: info.contact_address ?? 'Tashkent, Uzbekistan' },
            { icon: <Phone size={20} />,  label: 'Phone',    value: info.contact_phone ?? '+998 71 123 45 67' },
            { icon: <Mail size={20} />,   label: 'Email',    value: info.contact_email ?? 'info@maktab1.uz' },
            { icon: <Clock size={20} />,  label: 'Working Hours', value: 'Mon–Sat: 08:00 – 18:00' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
              <div className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-0.5">{item.label}</p>
                <p className="text-surface-900 dark:text-white font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map embed */}
        <div className="rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 min-h-[350px] bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
          {info.contact_lat && info.contact_lng ? (
            <iframe
              title="School Location"
              src={`https://maps.google.com/maps?q=${info.contact_lat},${info.contact_lng}&z=15&output=embed`}
              className="w-full h-full min-h-[350px]"
              loading="lazy"
            />
          ) : (
            <div className="text-center text-surface-400 p-8">
              <MapPin size={40} className="mx-auto mb-3 opacity-30" />
              <p>Map loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
