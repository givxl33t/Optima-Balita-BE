import { Attributes, Model, WhereAttributeHashValue } from "sequelize";
import slugify from "slugify";
import { Op } from "sequelize";

const generateSlug = async <T extends Model>(
  model: typeof Model & { new (): T },
  title: string,
): Promise<string> => {
  let articleSlug = slugify(title.split(" ").slice(0, 16).join(" "), {
    lower: true,
    locale: "id",
  });

  const existingSlug = (
    await model.findOne({
      attributes: ["slug"],
      where: {
        slug: { [Op.like]: `${articleSlug}%` },
      } as WhereAttributeHashValue<Attributes<T>[string]>,
      order: [["created_at", "DESC"]],
    })
  )?.getDataValue("slug");

  if (existingSlug) {
    const slugIndex: number = parseInt(existingSlug.split("-").at(-1));

    if (isNaN(slugIndex)) {
      articleSlug += "-1";
    } else {
      articleSlug += `-${slugIndex + 1}`;
    }
  }
  return articleSlug;
};

export default generateSlug;
