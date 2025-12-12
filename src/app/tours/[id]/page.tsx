 "use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Calendar, DollarSign, Users, Mountain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Image from "next/image";
import {Itinerary,SeasonalPricing,FAQ,Tour} from '@/schemas/singleTourSchema'
import { toast } from "sonner"

export default function SingleTourPage() {
  const router = useRouter()
  const { id } = useParams<{id:string}>()
  const [tour, setTour] = useState<Tour | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTour = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/tours/${id}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setTour(data)
      } catch (err) {
        console.error("Failed to fetch tour:", err)
        setError("Failed to load tour data")
        toast.error("Failed to load tour data")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchTour()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <p>Loading tour details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tours
        </Button>
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tours
        </Button>
        <div>No tour data found</div>
      </div>
    )
  }


    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tours
        </Button>

        <h1 className="mb-6 text-3xl font-bold">{tour.title}</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Image src={tour.images[0] || "/placeholder.svg"} alt={tour.title} className="rounded-lg" width={250} height={50} />
            <div className="mt-4 grid grid-cols-4 gap-4">
              {tour.images.map((image, index) => (
                <Image
                  key={index}
                  src={image || "/placeholder.svg"}
                  alt={`${tour.title} ${index + 1}`}
                  className="rounded-lg"
                  width={50}
                  height={50}

                />
              ))}
            </div>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{tour.location}</span>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>{tour.duration} days</span>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <span>${tour.price} per person</span>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>Max group size: {tour.maxGroupSize}</span>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                  <Mountain className="h-5 w-5 text-muted-foreground" />
                  <span>Difficulty: {tour.difficultyLevel}</span>
                </div>
                <p className="text-muted-foreground">{tour.description}</p>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Tour Category</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{tour.category}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full mt-8">
          <AccordionItem value="itinerary">
            <AccordionTrigger>Itinerary</AccordionTrigger>
            <AccordionContent>
              {tour.itineraries.map((day:Itinerary, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-lg font-semibold">
                    Day {day.day}: {day.title}
                  </h3>
                  <p className="text-muted-foreground">{day.description}</p>
                  <p>Accommodation: {day.accommodation}</p>
                  <p>Meals: {day.meals}</p>
                  <p>Time: {day.time}</p>
                  <p>Distance: {day.distance} km</p>
                  <p>Ascent: {day.ascent} m</p>
                  <p>Descent: {day.descent} m</p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="map">
            <AccordionTrigger>Map</AccordionTrigger>
            <AccordionContent>
              <div dangerouslySetInnerHTML={{ __html: tour.mapIframe }} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="includedServices">
            <AccordionTrigger>Included Services</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5">
                {tour.includedServices.map((item, index:number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="excludedServices">
            <AccordionTrigger>Excluded Services</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5">
                {tour.excludedServices.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="requiredEquipment">
            <AccordionTrigger>Required Equipment</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5">
                {tour.requiredEquipment.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faqs">
            <AccordionTrigger>Frequently Asked Questions</AccordionTrigger>
            <AccordionContent>
              {tour.faqs.map((faq:FAQ, index) => (
                <div key={index} className="mb-4">
                  <h4 className="font-semibold">{faq.question}</h4>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="termsAndConditions">
            <AccordionTrigger>Terms and Conditions</AccordionTrigger>
            <AccordionContent>
              <div dangerouslySetInnerHTML={{ __html: tour.termsAndConditions }} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="seasonalPricing">
            <AccordionTrigger>Seasonal Pricing</AccordionTrigger>
            <AccordionContent>
              {tour.seasonalPricing.map((pricing:SeasonalPricing, index) => (
                <div key={index} className="mb-2">
                  <p>
                    {pricing.startDate} to {pricing.endDate}: ${pricing.price}
                  </p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Meeting Point: {tour.meetingPoint}</p>
            <p>End Point: {tour.endPoint}</p>
            <p>Start Dates: {tour.startDates.join(", ")}</p>
            <p>Status: {tour.status}</p>
            <p>Related Tours: {tour.relatedTours.join(", ")}</p>
            <p>Keywords: {tour.keywords.join(", ")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

