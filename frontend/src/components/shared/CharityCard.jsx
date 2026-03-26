import { motion } from "framer-motion";
import { Heart, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

function CharityCard({ charity, selected, onSelect }) {
  const navigate = useNavigate();

  return (
    <Card className="relative overflow-hidden group" hover>
      {charity.featured && (
        <div className="absolute top-0 left-0 right-0 h-0.5 gradient-secondary" />
      )}
      <div className="h-48 bg-surface-container-low overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-primary-container to-tertiary-container flex items-center justify-center">
          <Heart className="w-12 h-12 text-primary/30" strokeWidth={1} />
        </div>
      </div>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-headline text-title-lg text-on-surface line-clamp-1">
            {charity.name}
          </h3>
          {charity.featured && (
            <Badge variant="secondary">Featured</Badge>
          )}
        </div>

        <Badge variant="outline" className="mb-3 text-label-sm">
          {charity.category}
        </Badge>

        <p className="text-body-md text-on-surface-variant line-clamp-2 mb-4">
          {charity.description}
        </p>

        <div className="flex items-center gap-2">
          {onSelect && (
            <Button
              variant={selected ? "primary" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => onSelect(charity.id)}
            >
              {selected ? "Selected" : "Choose"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/charities/${charity.id}`)}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CharityCard;
