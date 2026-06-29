import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitErrorHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { HeaderListLink } from "../../components/HeaderListLink";
import { MarkdownEditor } from "../../components/MarkdownEditor";
import { PageHeader } from "../../components/PageHeader";
import { useAppPreferences } from "../../contexts/AppPreferencesContext";
import {
  useNoticeDetailQuery,
  useSaveNoticeMutation,
} from "../../hooks/useNoticesQuery";
import { useDialogActions } from "../../store/dialogStore";
import type { NoticeStatus } from "../../types/admin";

interface NoticeEditorFormValue {
  title: string;
  category: string;
  status: NoticeStatus;
  content: string;
}

const noticeEditorSchema = z.object({
  title: z.string().refine((value) => value.trim().length > 0),
  category: z.string().refine((value) => value.trim().length > 0),
  status: z.enum(["draft", "published"]),
  content: z.string().refine((value) => value.trim().length > 0),
}) satisfies z.ZodType<NoticeEditorFormValue>;

const defaultNoticeFormValue: NoticeEditorFormValue = {
  title: "",
  category: "운영",
  status: "draft",
  content: "",
};

export function NoticeEditorPage() {
  const [searchParams] = useSearchParams();
  const noticeKey = searchParams.get("noticeKey") ?? "";
  const isEdit = Boolean(noticeKey);
  const { t } = useTranslation();
  const listPath = "/notices";

  const noticeQuery = useNoticeDetailQuery(noticeKey);

  if (isEdit && noticeQuery.isLoading) {
    return (
      <section>
        <PageHeader
          title={t("공지사항 수정")}
          description={t("에디터를 통해 공지사항 내용을 작성합니다.")}
          titleAction={<HeaderListLink to={listPath} />}
        />

        <div className="mx-3 mb-8 rounded-md bg-white shadow-md dark:bg-dark-surface">
          <div className="border-b border-slate-200 px-5 py-4 text-base font-semibold text-slate-700 dark:border-dark-border dark:text-slate-100">
            {t("공지사항 정보")}
          </div>

          <div className="space-y-5 px-5 py-6 animate-pulse">
            <div className="space-y-2">
              <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-700/70" />
              <div className="h-10 w-full rounded bg-slate-100 dark:bg-slate-700/70" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-700/70" />
              <div className="h-10 w-full rounded bg-slate-100 dark:bg-slate-700/70" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-700/70" />
              <div className="h-10 w-full rounded bg-slate-100 dark:bg-slate-700/70" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-700/70" />
              <div className="h-64 w-full rounded bg-slate-100 dark:bg-slate-700/70" />
            </div>
            <div className="flex justify-end gap-2">
              <div className="h-9 w-20 rounded bg-slate-100 dark:bg-slate-700/70" />
              <div className="h-9 w-20 rounded bg-slate-100 dark:bg-slate-700/70" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isEdit && noticeQuery.isError) {
    return (
      <section>
        <PageHeader
          title={t("공지사항 수정")}
          description={t("에디터를 통해 공지사항 내용을 작성합니다.")}
          titleAction={<HeaderListLink to={listPath} />}
        />

        <div className="mx-3 mb-8 rounded-md bg-white shadow-md dark:bg-dark-surface">
          <div className="border-b border-slate-200 px-5 py-4 text-base font-semibold text-slate-700 dark:border-dark-border dark:text-slate-100">
            {t("공지사항 정보")}
          </div>

          <p className="py-16 text-center text-sm text-rose-500">
            {t("공지사항을 불러오지 못했습니다.")}
          </p>
        </div>
      </section>
    );
  }

  if (isEdit && !noticeQuery.data) {
    return null;
  }

  const initialValue: NoticeEditorFormValue =
    isEdit && noticeQuery.data
      ? {
          title: noticeQuery.data.title,
          category: noticeQuery.data.category,
          status: noticeQuery.data.status,
          content: noticeQuery.data.content,
        }
      : defaultNoticeFormValue;

  return (
    <NoticeEditorForm
      key={noticeKey || "create"}
      noticeId={noticeKey || undefined}
      initialValue={initialValue}
      listPath={listPath}
    />
  );
}

interface NoticeEditorFormProps {
  noticeId?: string;
  initialValue: NoticeEditorFormValue;
  listPath: string;
}

function NoticeEditorForm({
  noticeId,
  initialValue,
  listPath,
}: NoticeEditorFormProps) {
  const isEdit = Boolean(noticeId);
  const { theme } = useAppPreferences();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openAlert, openConfirm } = useDialogActions();

  const saveMutation = useSaveNoticeMutation();

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<NoticeEditorFormValue>({
    defaultValues: initialValue,
    resolver: zodResolver(noticeEditorSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onValidSubmit = (values: NoticeEditorFormValue) => {
    openConfirm(t("공지사항을 저장하시겠습니까?"), () => {
      saveMutation.mutate(
        {
          id: noticeId,
          payload: {
            title: values.title.trim(),
            category: values.category.trim(),
            status: values.status,
            content: values.content,
          },
        },
        {
          onSuccess: () => {
            openAlert(t("처리되었습니다."));
            navigate(listPath);
          },
          onError: () => {
            openAlert(t("처리 중 오류가 발생했습니다."));
          },
        },
      );
    });
  };

  const onInvalidSubmit: SubmitErrorHandler<NoticeEditorFormValue> = () => {
    openAlert(t("제목, 카테고리, 내용을 모두 입력해주세요."));
  };

  return (
    <section className="notice-editor-scope">
      <PageHeader
        title={isEdit ? t("공지사항 수정") : t("공지사항 등록")}
        description={t("에디터를 통해 공지사항 내용을 작성합니다.")}
        titleAction={<HeaderListLink to={listPath} />}
      />

      <div className="mx-3 mb-8 rounded-md bg-white shadow-md dark:bg-dark-surface">
        <div className="border-b border-slate-200 px-5 py-4 text-base font-semibold text-slate-700 dark:border-dark-border dark:text-slate-100">
          {t("공지사항 정보")}
        </div>

        <form
          className="space-y-5 px-5 py-6"
          data-color-mode={theme === "dark" ? "dark" : "light"}
          onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        >
          <label className="block">
            <div className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
              {t("제목")} <span className="text-rose-500">*</span>
            </div>
            <input
              {...register("title")}
              className={`h-10 w-full rounded-md border px-3 text-sm text-slate-700 dark:bg-dark-surface-alt dark:text-slate-100 ${
                errors.title
                  ? "border-rose-400 dark:border-rose-500"
                  : "border-slate-200 dark:border-dark-border"
              }`}
            />
          </label>

          <label className="block">
            <div className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
              {t("카테고리")} <span className="text-rose-500">*</span>
            </div>
            <input
              {...register("category")}
              className={`h-10 w-full rounded-md border px-3 text-sm text-slate-700 dark:bg-dark-surface-alt dark:text-slate-100 ${
                errors.category
                  ? "border-rose-400 dark:border-rose-500"
                  : "border-slate-200 dark:border-dark-border"
              }`}
            />
          </label>

          <label className="block">
            <div className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
              {t("상태")}
            </div>
            <div className="relative">
              <select
                {...register("status")}
                className="h-10 w-full cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-700 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
              >
                <option value="draft">{t("임시저장")}</option>
                <option value="published">{t("게시")}</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                expand_more
              </span>
            </div>
          </label>

          <div>
            <div className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
              {t("에디터")} <span className="text-rose-500">*</span>
            </div>
            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <MarkdownEditor
                  value={field.value}
                  onChange={field.onChange}
                  hasError={Boolean(errors.content)}
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-dark-border dark:text-slate-200"
              onClick={() => navigate(listPath)}
            >
              {t("취소")}
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-md bg-main-color px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saveMutation.isPending}
            >
              {t("확인")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
