import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactElement } from "react";

export interface IFeatures {
    title:string , 
    description:string , 
    icon:ReactElement , 
    color:string
}

const FeatureCard = (feature:IFeatures) => {
    return (
        <Card className="h-full hover:shadow-lg transition-all duration-300 border-transparent hover:border-indigo-100 group">
            <CardHeader>
                <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${feature.color}`}>
                        {feature.icon}
                    </div>
                    <div>
                        <CardTitle className="group-hover:text-indigo-600 transition-colors">
                            {feature.title}
                        </CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <CardDescription>{feature.description}</CardDescription>
            </CardContent>
        </Card>
    )
}

export default FeatureCard;